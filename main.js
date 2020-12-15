class Particle extends createjs.Container {
	constructor(image, x, y, right, bottom) {
		super();
		this.x = x;
		this.y = y;
		this.right = right;
		this.bottom = bottom;
		this.velocityX = 0;
		this.velocityY = 0;
		this.friction = 0.95;
		this.addChild(image);
    }
    
	update(right, bottom) {
		this.right = right;
		this.bottom = bottom;
    }
    
	accelerateTo(targetX, targetY) {
		let _x = this.x;
		let _y = this.y;
		let _velocityX = this.velocityX * 0.95;
		let _velocityY = this.velocityY * 0.95;
		const differenceX = targetX - _x;
		const differenceY = targetY - _y;
		const square = differenceX * differenceX + differenceY * differenceY;
		let ratio;
		if (square > 0) {
			ratio = 50 / square;
		} else {
			ratio = 0;
        }
        
		const accelerationX = differenceX * ratio;
		const accelerationY = differenceY * ratio;
		_velocityX += accelerationX;
		_velocityY += accelerationY;
		_velocityX *= this.friction;
		_velocityY *= this.friction;
		_x += _velocityX;
        _y += _velocityY;
        
		if (_x < 0) {
			_x += this.right;
		} else if (_x > this.right) {
			_x -= this.right;
        }
        
		if (_y < 0) {
			_y += this.bottom;
		} else if (_y > this.bottom) {
			_y -= this.bottom;
        }
        
		this.x = _x;
		this.y = _y;
		this.velocityX = _velocityX;
		this.velocityY = _velocityY;
	}
}


class LinkedList {
	push(element) {
		const _last = this.last;
		if (_last) {
			_last.next = element;
			element.prev = _last;
			this.last = element;
		} else {
			this.first = this.last = element;
		}
	}
}


let stage;
let stageWidth;
let stageHeight;
const mousePoint = new createjs.Point();
const particles = new LinkedList();
const numParticles = 1500;
let canvasElement;
let fader;
const color = '#000000';
const stats = new Stats();


function initialize() {
	const outDOM = document.getElementById('output');
	canvasElement = document.getElementById('myCanvas');
	stageWidth = window.innerWidth;
	stageHeight = window.innerHeight;
	canvasElement.width = stageWidth;
	canvasElement.height = stageHeight;
	resetStage();
	// outDOM.appendChild(stats.domElement);
	setStatsStyle('absolute', '0px');
	stage = new createjs.StageGL(canvasElement, {preserveBuffer: true, antialias: true});
	stage.autoClear = false;
	stage.setClearColor(color);
	fader = createFader(stageWidth, stageHeight);
	stage.addChild(fader);
	stage.updateViewport(stageWidth, stageHeight);
	mousePoint.x = stageWidth / 3;
	mousePoint.y = stageHeight / 3;
	createParticles(numParticles, 0.9);
	stage.update();
	stage.addEventListener('stagemousemove', recordMousePoint);
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener('tick', updateAnimation);
    window.addEventListener('resize', handleResize);
}


function createFader(width, height) {
	fader = new createjs.Shape();
	resetFader(width, height);
	return fader;
}


function resetFader(width, height) {
	fader.graphics.beginFill(color)
	.drawRect(0, 0, width, height);
	fader.cache(0, 0, width, height);
	fader.alpha = 0.15;
}


function setStatsStyle(position, top) {
	const statsStyle = stats.domElement.style;
	statsStyle.position = position;
	statsStyle.top = top;
}


function handleResize(event) {
	stageWidth = window.innerWidth;
	stageHeight = window.innerHeight;
	canvasElement.width = stageWidth;
	canvasElement.height = stageHeight;
	resetStage();
	fader.graphics.clear();
	resetFader(stageWidth, stageHeight);
	let particle = particles.first;
	while (particle) {
		particle.update(stageWidth, stageHeight);
		particle = particle.next;
    }
    
	stage.updateViewport(stageWidth, stageHeight);
	stage.clear();
}


function resetStage() {
	stageWidth = window.innerWidth;
	stageHeight = window.innerHeight;
	canvasElement.width = stageWidth;
	canvasElement.height = stageHeight;
}


function recordMousePoint(eventObject) {
	mousePoint.x = eventObject.stageX;
	mousePoint.y = eventObject.stageY;
}


function updateAnimation(eventObject) {
	const mouseX = mousePoint.x;
	const mouseY = mousePoint.y;
	let particle = particles.first;
	stats.begin();
	while (particle) {
		particle.accelerateTo(mouseX, mouseY);
		particle = particle.next;
	}
	stats.end();
	stage.update(eventObject);
}


function drawParticle(radius) {
	const shape = new createjs.Shape();
	const size = radius * 2;
	shape.graphics.beginFill('white')
	.drawRect(-radius, -radius, size, size);
	shape.cache(-radius, -radius, size, size);
	return shape.cacheCanvas;
}


function createParticles(amount, radius) {
	const bit = drawParticle(radius);
	for (let i = 0; i < amount; i++) {
		const _x = Math.random() * stageWidth;
		const _y = Math.random() * stageHeight;
		const particleImage = new createjs.Bitmap(bit);
		const particle = new Particle(particleImage, _x, _y, stageWidth, stageHeight);
		particles.push(particle);
		stage.addChild(particle);
	}
}


document.addEventListener('DOMContentLoaded', initialize);