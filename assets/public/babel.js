'use strict';

//<li><a href='${img.href}' target='_blank' title='Click for Full Quality'><img class='image' src='${img.src}' ${ index > 7 ? "loading='lazy'" : "" }></a></li>
class Image extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let {
      name
    } = this.props;
    return /*#__PURE__*/React.createElement("a", {
      href: `https://masons.photography/${name}.jpg`,
      target: "_blank",
      title: "Click for Full Quality"
    }, /*#__PURE__*/React.createElement("img", {
      class: "image",
      src: `https://masons.photography/${name}.webp`,
      loading: "lazy"
    }));
  }
}
class Gallery extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let {
      images
    } = this.props;
    return images.map(img => {
      return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Image, {
        name: img
      }));
    });
  }
}
const root = ReactDOM.createRoot(document.querySelector('#gallery'));
root.render( /*#__PURE__*/React.createElement(Gallery, {
  images: ['IMG_7414', 'IMG_7505', 'IMG_7474', 'IMG_7475']
}));
