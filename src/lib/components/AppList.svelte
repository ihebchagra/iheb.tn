<script>
	import Icon from 'svelte-awesome';
	import book from 'svelte-awesome/icons/book';
	import search from 'svelte-awesome/icons/search';
	import graduationCap from 'svelte-awesome/icons/graduationCap';
	import medkit from 'svelte-awesome/icons/medkit';
	import paw from 'svelte-awesome/icons/paw';
	import random from 'svelte-awesome/icons/random';
	import android from 'svelte-awesome/icons/android';
	import ellipsisH from 'svelte-awesome/icons/ellipsisH';
	import question from 'svelte-awesome/icons/question';
	import list from 'svelte-awesome/icons/list';
	import fire from 'svelte-awesome/icons/fire';
</script>

<a class="btn variant-soft-warning" href="https://promety.tn">
	<Icon data={fire} />
	<span>PROMETY</span>
</a>
<a href="https://eucast.iheb.tn">
	<Icon data={book} />
	<span>EUCAST/CA-SFM search</span>
</a>
<a href="/medicasearch">
	<Icon data={medkit} />
	<span>Médicasearch</span>
</a>
<a href="https://annexe.iheb.tn">
	<Icon data={list} />
	<span>Annexe Ultime en Médecine</span>
</a>
<a href="https://quiz.iheb.tn">
	<Icon data={question} />
	<span>Quiz Bi-Hebdomadaire</span>
</a>
<a href="/ecn/polysearch">
	<Icon data={graduationCap} />
	<span>Polysearch ECN</span>
</a>
<a href="/ecn/seriesearch">
	<Icon data={book} />
	<span>Sériesearch ECN</span>
</a>
<a href="/ecn/3altayer">
	<Icon data={random} />
	<span>ECN 3al Tayer</span>
</a>
<a href="/polysearchfmt">
	<Icon data={search} />
	<span>Polysearch FMT</span>
</a>
<a href="/medicavet">
	<Icon data={paw} />
	<span>Médicavet</span>
</a>
<!-- <a href="/cooltools">
	<Icon data={ellipsisH} />
	<span>Autres Outils</span>
</a> -->
<a href="https://play.google.com/store/apps/dev?id=6616843757334685090">
	<Icon data={android} />
	<span>Mes Applications Android</span>
</a>