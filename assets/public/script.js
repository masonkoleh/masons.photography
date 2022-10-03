document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.date').forEach(elemnt => {
		elemnt.innerHTML = new Date(elemnt.innerHTML).toLocaleString('en-US', {
			dateStyle: 'full',
			timeStyle: 'medium'
		});
	});
	
	/* 	Lazy Loading Script
	let images = document.querySelectorAll('.lazyload');
	if ('IntersectionObserver' in window) {
		let imgobserver = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					let image = entry.target;
					image.src = image.dataset.src;
					image.classList.remove('lazyload');
					observer.unobserve(image);
				}
			});
		});

		images.forEach(image => imgobserver.observe(image));
	} else {
		var throttle;
		function lazyload() {
			if (throttle) clearTimeout(throttle);
			throttle = setTimeout(() => {
				let top = window.pageYOffset;
				images.forEach(img => {
					if (img.offsetTop < (window.innerHeight + top)) {
						img.src = img.dataset.src;
						img.classList.remove('lazyload');
					}
				});

				if (!Bolean(images.length)) {
					document.removeEventListener('scroll', lazyload);
					window.removeEventListener('resize', lazyload);
					window.removeEventListener('orientationChange', lazyload);
				}
			}, 20);
		}

		document.addEventListener('scroll', lazyload);
		window.addEventListener('resize', lazyload);
		window.addEventListener('orientationChange', lazyload);
	}
	*/
});