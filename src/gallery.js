'use strict';

//<li><a href='${img.href}' target='_blank' title='Click for Full Quality'><img class='image' src='${img.src}' ${ index > 7 ? "loading='lazy'" : "" }></a></li>
class Image extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let { name } = this.props;
		return <a href={`https://masons.photography/${name}.jpg`} target='_blank' title='Click for Full Quality'>
			<img class="image" src={`https://masons.photography/${name}.webp`} loading="lazy"/>
		</a>;
	}
}

class Gallery extends React.Component {
	constructor(props) { super(props); }
	render() {
		let { images } = this.props;
		return images.map(img => {
			return <li><Image name={img}/></li>;
		});
	}
}

import fs from 'fs';
import path from 'path';

fs.readdirSync(path.join(process.cwd(), ''))

const root = ReactDOM.createRoot(document.querySelector('#gallery'));
root.render(<Gallery images={['IMG_7414', 'IMG_7505', 'IMG_7474', 'IMG_7475']}/>);