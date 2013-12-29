function Element(name, attrs, children) {
	if (!(this instanceof Element)) {
		return new Element(name, attrs, children);
	}

	// TODO: attrs/children are optional, check which one to take

	// TODO: children should be either a buffer or an array of Element's

	this.name = name;
	this.attrs = attrs || {};
	this.children = children || [];
}

module.exports = Element;