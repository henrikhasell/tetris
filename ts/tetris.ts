namespace Tetris {
    export const enum State {
        TapToStart,
        Move,
        Blink,
        GameOver
    }
    export const enum Colour {
        Red, Green, Blue, Yellow, Magenta, Cyan, Orange
    }
    export interface Controls {
        moveLeft?:number;
        moveRight?:number;
        moveDown?:boolean;
        rotate?:number;
    }
    export interface Shape {
        points:PIXI.Point[];
        colour:Colour;
        offset?:PIXI.Point;
    }
    export class Debris {
        protected static SHAPES:Shape[] = [
            {
                points: [
                    new PIXI.Point(0, 0),
                    new PIXI.Point(1, 0),
                    new PIXI.Point(2, 0),
                    new PIXI.Point(3, 0)
                ],
                offset: new PIXI.Point(2, 0),
                colour: Colour.Red
            },
            {
                points: [
                    new PIXI.Point(0, 0),
                    new PIXI.Point(1, 0),
                    new PIXI.Point(2, 0),
                    new PIXI.Point(2, 1)
                ],
                offset: new PIXI.Point(1.5, 1.5),
                colour: Colour.Blue
            },
            {
                points: [
                    new PIXI.Point(0, 1),
                    new PIXI.Point(0, 0),
                    new PIXI.Point(1, 0),
                    new PIXI.Point(2, 0)
                ],
                offset: new PIXI.Point(1.5, 1.5),
                colour: Colour.Orange
            },
            {
                points: [
                    new PIXI.Point(0, 0),
                    new PIXI.Point(1, 0),
                    new PIXI.Point(0, 1),
                    new PIXI.Point(1, 1)
                ],
                offset: new PIXI.Point(1, 1),
                colour: Colour.Yellow
            },
            {
                points: [
                    new PIXI.Point(1, 0),
                    new PIXI.Point(2, 0),
                    new PIXI.Point(0, 1),
                    new PIXI.Point(1, 1)
                ],
                offset: new PIXI.Point(1.5, 1.5),
                colour: Colour.Magenta
            },
            {
                points: [
                    new PIXI.Point(0, 1),
                    new PIXI.Point(1, 1),
                    new PIXI.Point(2, 1),
                    new PIXI.Point(1, 0)
                ],
                offset: new PIXI.Point(1.5, 1.5),
                colour: Colour.Cyan
            },
            {
                points: [
                    new PIXI.Point(0, 0),
                    new PIXI.Point(1, 0),
                    new PIXI.Point(1, 1),
                    new PIXI.Point(2, 1)
                ],
                offset: new PIXI.Point(1.5, 1.5),
                colour: Colour.Green
            }
        ];

        protected shape:Tetris.Shape;
        protected container:PIXI.Container;
        
        public constructor() {
            this.container = new PIXI.Container();
            this.resetContainer();
            gameContainer.addChild(this.container);  
        }

        protected getRandomShape():Tetris.Shape {
            return Debris.SHAPES[Math.floor(Math.random() * Debris.SHAPES.length)];
        }

        protected initialiseContainer(shape:Tetris.Shape):void {
            this.container.rotation = 0;
            this.container.removeChildren();
            for(let point of shape.points) {
                let texture:PIXI.Texture;
                switch(shape.colour) {
                    case Tetris.Colour.Red: texture = redTexture; break;
                    case Tetris.Colour.Green: texture = greenTexture; break;
                    case Tetris.Colour.Blue: texture = blueTexture; break;
                    case Tetris.Colour.Orange: texture = orangeTexture; break;
                    case Tetris.Colour.Yellow: texture = yellowTeture; break;
                    case Tetris.Colour.Magenta: texture = magentaTexture; break;
                    case Tetris.Colour.Cyan: texture = cyanTexture; break;
                }
                let sprite:PIXI.Sprite = new PIXI.Sprite(texture);
                sprite.position.x = (point.x - shape.offset.x + 0.5) * tileW;
                sprite.position.y = (point.y - shape.offset.y + 0.5) * tileH;
                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;
                this.container.addChild(sprite);
            }
        }

        public resetContainer():void {
            if(next && this != next) {
                this.shape = next.shape;
                next.resetContainer();
            }
            else {
                this.shape = this.getRandomShape();
            }
            this.initialiseContainer(this.shape);
        }

        public resetPosition():void {
            this.container.position.x = tileW * (Math.ceil(gridW / 2 - this.shape.offset.x) + this.shape.offset.x % 1);
            this.container.position.y = -tileH * (4 + this.shape.offset.y % 1);
        }

        public respawn():void {
            this.resetContainer();
            this.resetPosition(); 
        }

        public step(grid:PIXI.Sprite[][]):void {
            this.container.position.y += tileH;
            if(this.collide(grid)) {
                this.container.position.y -= tileH;
                this.solidify(grid);
                let rows:number[] = this.getRows();
                this.respawn();
                checkRows(grid, rows);
            }
        }

        public getRows():number[] {

            let positions:number[] = [];

            for(let child of <PIXI.Sprite[]>this.container.children) {
                positions.push(this.transform(<PIXI.Point>child.position).y);
            }

            let unique:number[] = [];

            for(let position of positions) {
                if(unique.indexOf(position) == -1) {
                    unique.push(position);
                }
            }

            return unique;
        }

        public rotate(grid:PIXI.Sprite[][]):void {
            
            const rotation:number = this.container.rotation;

            this.container.rotation += Math.PI / 2;

            if(this.collide(squares)) {
                this.container.rotation = rotation;
            }
            else {
                for(let child of this.container.children) {
                    child.rotation -= Math.PI / 2;
                }
            }
        }

        protected transform(position:PIXI.Point):PIXI.Point {

            const cos_val:number = Math.cos(this.container.rotation);
            const sin_val:number = Math.sin(this.container.rotation);

            const vertex:PIXI.Point = new PIXI.Point(
                Math.floor((this.container.position.x + cos_val * position.x - sin_val * position.y) / tileW),
                Math.floor((this.container.position.y + sin_val * position.x + cos_val * position.y) / tileH)
            );

            return vertex;
        }
        protected collide(grid:PIXI.Sprite[][]):boolean {
            for(let child of <PIXI.Sprite[]>this.container.children) {
                const position:PIXI.Point = this.transform(<PIXI.Point>child.position);
                // Is the segment out of legal bounds? This constitutes a collision.
                if(position.x < 0 || position.x >= gridW || position.y >= gridH) {
                    return true;
                }
                // Is the segment position legal, but outside the grid of existing shapes?
                if(grid[position.x] == undefined || grid[position.x][position.y] == undefined) {
                    continue;
                }
                // Is the segment colliding with the grid of existing shapes?
                if(grid[position.x][position.y].texture != squareTexture) {
                    return true;
                }
            }
            return false;
        }

        protected solidify(grid:PIXI.Sprite[][]):void {
            for(let child of <PIXI.Sprite[]>this.container.children) {
                const position:PIXI.Point = this.transform(<PIXI.Point>child.position);
                if(grid[position.x] && grid[position.x][position.y]) {
                    grid[position.x][position.y].texture = child.texture;
                }
                else {
                    state = Tetris.State.GameOver;
                }
            }
        }

        protected move(grid:PIXI.Sprite[][], position:PIXI.Point):void {
            // Remember the previous position of the shape:
            const previous:PIXI.Point = new PIXI.Point(
                this.container.position.x,
                this.container.position.y
            );
            // Move the shape to it's new position:
            this.container.position = position;
            // Check if the new position collides with the world:
            if(this.collide(grid)) {
                // If so, revert to the previous position:
                this.container.position = previous;
            }
        }

        public moveLeft(grid:PIXI.Sprite[][]):void {
            this.move(grid, new PIXI.Point(
                this.container.position.x - tileW,
                this.container.position.y
            ));
        }

        public moveRight(grid:PIXI.Sprite[][]):void {
            this.move(grid, new PIXI.Point(
                this.container.position.x + tileW,
                this.container.position.y
            ));
        }
    }

    export class NextDebris extends Debris {
        public constructor() {
            super();
        }
        protected initialiseContainer(shape:Tetris.Shape):void {
            this.container.rotation = 0;
            this.container.removeChildren();
            let maxX:number = 0;
            let maxY:number = 0;
            for(let point of shape.points) {
                if(point.x > maxX) {
                    maxX = point.x;
                }
                if(point.y > maxY){
                    maxY = point.y;
                }
                let texture:PIXI.Texture;
                switch(shape.colour) {
                    case Tetris.Colour.Red: texture = redTexture; break;
                    case Tetris.Colour.Green: texture = greenTexture; break;
                    case Tetris.Colour.Blue: texture = blueTexture; break;
                    case Tetris.Colour.Orange: texture = orangeTexture; break;
                    case Tetris.Colour.Yellow: texture = yellowTeture; break;
                    case Tetris.Colour.Magenta: texture = magentaTexture; break;
                    case Tetris.Colour.Cyan: texture = cyanTexture; break;
                }
                let sprite:PIXI.Sprite = new PIXI.Sprite(texture);
                sprite.position.x = point.x  * tileW;
                sprite.position.y = point.y  * tileH;
                this.container.addChild(sprite);
            }
            let w:number = (maxX + 1) * tileW;
            let h:number = (maxY + 1) * tileH;
            this.container.scale.x = 0.75;
            this.container.scale.y = 0.75;
            this.container.position.x = (tileW * 9.4) - (w / 2) * this.container.scale.x;
            this.container.position.y = (tileH * -1)   - (h / 2) * this.container.scale.y;
        }
    }
}

const tileW:number = 32;
const tileH:number = 32;

const gridW:number = 10;
const gridH:number = 19;

const screenW:number = 384;
const screenH:number = 768;

let application:PIXI.Application;
let gameContainer:PIXI.Container = new PIXI.Container();
let squaresContainer:PIXI.Container = new PIXI.Container();
let blinkContainer:PIXI.Container = new PIXI.Container();
let buttonContainer:PIXI.Container = new PIXI.Container();
let tapToStartText:PIXI.Text;
let scoreText:PIXI.Text;
let nextText:PIXI.Text;
let redTexture:PIXI.Texture;
let greenTexture:PIXI.Texture;
let blueTexture:PIXI.Texture;
let orangeTexture:PIXI.Texture;
let yellowTeture:PIXI.Texture;
let magentaTexture:PIXI.Texture;
let cyanTexture:PIXI.Texture;
let squareTexture:PIXI.Texture;
let backgroundTexture:PIXI.Texture;
let buttonTexture:PIXI.Texture;
let squares:PIXI.Sprite[][] = [];
let shape:Tetris.Debris;
let next:Tetris.Debris;
let state:Tetris.State = Tetris.State.TapToStart;
let controls:Tetris.Controls = {};
let stepCount:number = 0;
let completedRows:number[];

PIXI.loader
    .add([
        "images/red.bmp",
        "images/green.bmp",
        "images/blue.bmp",
        "images/square.bmp",
        "images/orange.bmp",
        "images/cyan.bmp",
        "images/magenta.bmp",
        "images/yellow.bmp",
        "images/background.png",
        "images/button.png"
    ])
    .load(setup);

function timeStep():void {
    stepCount++;
    switch(state) {
        case Tetris.State.Move:
            if(controls.moveDown || stepCount % 16 == 0) {
                shape.step(squares);
                stepCount = 0;
            }
            break;
        case Tetris.State.Blink:
            blinkContainer.visible = !blinkContainer.visible;
            if(stepCount > 8) {
                blinkContainer.removeChildren();
                shift(squares, completedRows);
                state = Tetris.State.Move;
            }
            break;
        case Tetris.State.GameOver:
            if(stepCount % 8 == 1) {
                let interval:number = Math.ceil(stepCount / 8);
                if(interval <= gridH) {
                    for(let x:number = 0; x < gridW; x++) {
                        squares[x][gridH - interval].texture = redTexture;
                    }
                }
                else if(interval <= gridH * 2) {
                    for(let x:number = 0; x < gridW; x++) {
                        squares[x][interval - gridH - 1].texture = squareTexture;
                    }
                }
                else {
                    state = Tetris.State.TapToStart;
                    tapToStartText.visible = true;
                    stepCount = 0;
                }
            }
    }

    const repeatDelay:number = 20;

    if(controls.moveLeft) {
        if(controls.moveLeft++ == 1 || controls.moveLeft > repeatDelay) {
            shape.moveLeft(squares);
        }
    }
    if(controls.moveRight) {
        if(controls.moveRight++ == 1 || controls.moveRight > repeatDelay) {
            shape.moveRight(squares);
        }
    }
    if(controls.rotate) {
        if(controls.rotate++ == 1 || controls.rotate > repeatDelay) {
            shape.rotate(squares);
        }
    }
}

function shift(grid:PIXI.Sprite[][], rows:number[]):void {
    rows = rows.sort();
    for(let row of rows) {
        for(let y:number = row; y > 0; y--) {
            for(let x:number = 0; x < gridW; x++) {
                grid[x][y] = grid[x][y - 1];
                grid[x][y].position.y += tileH;
                squaresContainer.addChild(grid[x][0] = createCell(x, 0));
            }
        }
    }
}

function checkRows(grid:PIXI.Sprite[][], rows:number[]):void {
    completedRows = [];
    for(let row of rows) {
        let complete:boolean = true;
        for(let x:number = 0; x < gridW; x++) {
            if(!grid[x][row] || grid[x][row].texture == squareTexture) {
                complete = false;
                break;
            }
        }
        if(complete) {
            completedRows.push(row);
        }
    }

    if(completedRows.length) {
        completedRows = completedRows.sort((a:number, b:number) => {
            return a > b ? a : b;
        });
        for(let row of completedRows) {
            for(let x:number = 0; x < gridW; x++) {
                const sprite:PIXI.Sprite = grid[x][row];
                squaresContainer.removeChild(sprite);
                blinkContainer.addChild(sprite);
            }
        }
        state = Tetris.State.Blink;
        stepCount = 0;
    }
}

window.onkeydown = (event:KeyboardEvent) => {
    switch(event.key) {
        case 'a':
            shape.moveLeft(squares);
            break;
        case 'd':
            shape.moveRight(squares);
            break;
        case 's':
            controls.moveDown = true;
            break;
        case 'r':
            shape.rotate(squares);
            break;
    }
};

window.onkeyup = (event:KeyboardEvent) => {
    switch(event.key) {
        case 's':
            controls.moveDown = false;
            break;
    }
};

function createCell(x:number, y:number):PIXI.Sprite {
    let sprite = new PIXI.Sprite(squareTexture);
    sprite.position.x = x * tileW;
    sprite.position.y = y * tileH;
    return sprite;
}

let dbg_btn:PIXI.Sprite[] = [];

function setup():void {
    redTexture = PIXI.loader.resources['images/red.bmp'].texture;
    greenTexture = PIXI.loader.resources['images/green.bmp'].texture;
    blueTexture = PIXI.loader.resources['images/blue.bmp'].texture;
    squareTexture = PIXI.loader.resources['images/square.bmp'].texture;
    orangeTexture = PIXI.loader.resources['images/orange.bmp'].texture;
    yellowTeture = PIXI.loader.resources['images/yellow.bmp'].texture;
    cyanTexture = PIXI.loader.resources['images/cyan.bmp'].texture;
    magentaTexture = PIXI.loader.resources['images/magenta.bmp'].texture;
    backgroundTexture = PIXI.loader.resources['images/background.png'].texture;
    buttonTexture = PIXI.loader.resources['images/button.png'].texture;
    gameContainer.position.x = tileW;
    gameContainer.position.y = tileH * 2;
    gameContainer.addChild(squaresContainer);
    gameContainer.addChild(blinkContainer);
    for(let x:number = 0; x < gridW; x++) {
        squares[x] = [];
        for(let y:number = 0; y < gridH; y++) {
            squaresContainer.addChild(squares[x][y] = createCell(x, y));  
        }
    }
    let buttonPositions:PIXI.Point[] = [
        new PIXI.Point(tileW*0, tileH*21),
        new PIXI.Point(tileW*9, tileH*21),
        new PIXI.Point(tileW*3, tileH*21),
        new PIXI.Point(tileW*6, tileH*21)
    ];
    for(let i in buttonPositions) {
        let button:PIXI.Sprite = new PIXI.Sprite(buttonTexture);
        switch(+i) {
            case 0:
                button.on('pointerdown', () => controls.moveLeft = 1);
                button.on('pointerup', () => controls.moveLeft = 0);
                button.on('pointerupoutside', () => controls.moveLeft = 0);
                break;
            case 1:
                button.on('pointerdown', () => controls.moveRight = 1);
                button.on('pointerup', () => controls.moveRight = 0);
                button.on('pointerupoutside', () => controls.moveRight = 0);
                break;
            case 2:
                button.on('pointerdown', () => controls.moveDown = true);
                button.on('pointerup', () => controls.moveDown = false);
                button.on('pointerupoutside', () => controls.moveDown = false);
                break;
            case 3:
                button.on('pointerdown', () => controls.rotate = 1);
                button.on('pointerup', () => controls.rotate = 0);
                button.on('pointerupoutside', () => controls.rotate = 0);
                break;
        }
        button.interactive = true;
        button.position.x = buttonPositions[i].x;
        button.position.y = buttonPositions[i].y;
        button.alpha = 0.2;
        buttonContainer.addChild(button);
        dbg_btn.push(button);
    }
    let tapToStartStyle:PIXI.TextStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontWeight: 'bold',
        align:'center'
    });
    let navbarStyle:PIXI.TextStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontWeight: 'bold'
    });
    tapToStartText = new PIXI.Text('Touch the Screen\nTo Start', tapToStartStyle);
    tapToStartText.anchor.x = 0.5;
    tapToStartText.anchor.y = 0.5;
    tapToStartText.x = tileW * 6;
    tapToStartText.y = tileH * 8;

    scoreText = new PIXI.Text('Score: 0', navbarStyle);
    scoreText.position.x = 20;
    scoreText.position.y = 16;
    nextText = new PIXI.Text('Next:', navbarStyle);
    nextText.position.x = 220;
    nextText.position.y = 16;

    application = new PIXI.Application({
        backgroundColor:0xffffff,
        width:screenW,
        height:screenH
    });
    application.stage.addChild(gameContainer);
    application.stage.addChild(new PIXI.Sprite(backgroundTexture));
    application.stage.addChild(buttonContainer);
    application.stage.addChild(tapToStartText);
    application.stage.addChild(scoreText);
    application.stage.addChild(nextText);
    shape = new Tetris.Debris();
    next = new Tetris.NextDebris();
    shape.resetPosition();
    document.body.appendChild(application.view);
    window.setInterval(timeStep, 25);
    window.onresize = () =>
    {
        const w:number = application.view.clientWidth;
        const h:number = application.view.clientHeight;
        const ratio:number = w / h;
        
        if(ratio < screenW / screenH)
        {
            let scale:number = h * (screenW / w);
            application.stage.x = 0;
            application.stage.y = scale / 2 - screenH / 2;
            application.renderer.resize(screenW, scale);
        }
        else
        {
            let scale:number = w * (screenH / h);
            application.stage.x = scale / 2 - screenW / 2;
            application.stage.y = 0;
            application.renderer.resize(scale, screenH);
        }
    };
    application.view.onpointerup = () =>
    {
        if(state == Tetris.State.TapToStart) {
            application.view.webkitRequestFullscreen();
            tapToStartText.visible = false;
            state = Tetris.State.Move;
        }
    };
    window.onresize(null);
}
