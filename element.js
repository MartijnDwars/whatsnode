function Element(name, attrs, children) {
	if (!(this instanceof Element)) {
		return new Element(name, attrs, children);
	}

	// TODO: attrs/children are optional, check which one to take

	this.name = name;
	this.attrs = attrs;
	this.children = children;
}

module.exports = Element;