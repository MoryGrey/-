(function(){
	const tg = window.Telegram?.WebApp;
	if (tg) tg.expand();

	const meBox = document.getElementById('me-content');
	const candBox = document.getElementById('candidate-content');
	const likeBtn = document.getElementById('like');
	const dislikeBtn = document.getElementById('dislike');

	const initData = tg?.initDataUnsafe || {};
	const me = initData?.user || {};
	const tgId = me?.id;

	async function apiGet(path) {
		const r = await fetch(path);
		return await r.json();
	}
	async function apiPost(path, body) {
		const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
		return await r.json();
	}

	function renderProfile(user, target) {
		const photo = user.photo_url ? `<img src="${user.photo_url}" alt="">` : '<div style="width:96px;height:96px;background:#eee;border-radius:8px"></div>';
		return `
			<div class="profile">
				${photo}
				<div>
					<div><strong>${user.name}</strong></div>
					<div class="meta">${user.age} • ${user.city} • ${user.gender}</div>
					<div class="desc">${user.description || ''}</div>
				</div>
			</div>
		`;
	}

	async function loadMe() {
		if (!tgId) { meBox.textContent = 'Откройте через Telegram'; return; }
		const data = await apiGet(`/api/me?tg_id=${tgId}`);
		if (data.error) { meBox.textContent = 'Сначала зарегистрируйтесь в боте.'; return; }
		meBox.innerHTML = renderProfile(data);
	}

	let currentCandidate = null;
	async function loadNext() {
		candBox.textContent = 'Загрузка...';
		const data = await apiGet(`/api/next?tg_id=${tgId}`);
		if (!data.candidate) { candBox.textContent = 'Пока нет анкет в вашем городе.'; currentCandidate = null; return; }
		currentCandidate = data.candidate;
		candBox.innerHTML = renderProfile(currentCandidate);
	}

	likeBtn.addEventListener('click', async () => {
		if (!currentCandidate) return;
		await apiPost('/api/like', { tg_id: tgId, target_id: currentCandidate.tg_id });
		await loadNext();
	});
	dislikeBtn.addEventListener('click', async () => {
		if (!currentCandidate) return;
		await apiPost('/api/dislike', { tg_id: tgId, target_id: currentCandidate.tg_id });
		await loadNext();
	});

	loadMe();
	loadNext();
})();
