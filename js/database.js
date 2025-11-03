// Database Loader - Reusable for any SQL.js database
class DatabaseLoader {
    constructor(config = {}) {
        this.dbPath = config.dbPath;
        this.onProgress = config.onProgress || (() => {});
        this.onComplete = config.onComplete || (() => {});
        this.onError = config.onError || (() => {});
        this.db = null;
        this.SQL = null;
    }

    async load() {
        try {
            this.onProgress('Initialisation...', 5);
            
            // Load SQL.js
            this.SQL = await initSqlJs({
                locateFile: filename => `/${filename}`
            });
            
            this.onProgress('Demande du fichier de base de données...', 15);
            
            // Fetch database with progress
            const response = await fetch(this.dbPath);
            if (!response.ok) {
                throw new Error(`Échec de la récupération: ${response.statusText}`);
            }
            
            const contentLength = response.headers.get('Content-Length');
            const totalSize = contentLength ? parseInt(contentLength, 10) : null;
            
            if (totalSize) {
                this.onProgress(`Téléchargement (${(totalSize / 1024 / 1024).toFixed(2)} Mo)...`, 20);
            } else {
                this.onProgress('Chargement de la base de données...', 20);
            }
            
            // Stream the response
            const reader = response.body.getReader();
            let bytesLoaded = 0;
            let chunks = [];
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                chunks.push(value);
                bytesLoaded += value.length;
                
                if (totalSize) {
                    const progress = (bytesLoaded / totalSize) * 100;
                    this.onProgress(
                        `Téléchargement... ${(bytesLoaded / 1024 / 1024).toFixed(2)} Mo / ${(totalSize / 1024 / 1024).toFixed(2)} Mo`,
                        Math.min(95, 20 + (progress * 0.75))
                    );
                } else {
                    this.onProgress(`Chargement... ${(bytesLoaded / 1024 / 1024).toFixed(2)} Mo`, 50);
                }
            }
            
            this.onProgress('Traitement...', 95);
            
            // Combine chunks
            const finalSize = totalSize || bytesLoaded;
            let dbArray = new Uint8Array(finalSize);
            let offset = 0;
            for (const chunk of chunks) {
                dbArray.set(chunk, offset);
                offset += chunk.length;
            }
            chunks = null; // Free memory
            
            this.onProgress('Chargement en mémoire...', 98);
            this.db = new this.SQL.Database(dbArray);
            
            this.onProgress('Base de données prête !', 100);
            this.onComplete(this.db);
            
            return this.db;
            
        } catch (err) {
            this.onError(err);
            throw err;
        }
    }

    query(sql, params = []) {
        if (!this.db) {
            throw new Error('Database not loaded');
        }
        
        const stmt = this.db.prepare(sql);
        stmt.bind(params);
        
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        
        return results;
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
