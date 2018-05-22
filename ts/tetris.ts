namespace Tetris {
    export class Shape {
        protected static OFFSETS:PIXI.Point[][] = [
            [
                new PIXI.Point(-2, 0),
                new PIXI.Point(-1, 0),
                new PIXI.Point(0, 0),
                new PIXI.Point(1, 0),
            ],
            [
                new PIXI.Point(-1, -1),
                new PIXI.Point(0, -1),
                new PIXI.Point(1, -1),
                new PIXI.Point(1, 0)
            ],
            [
                new PIXI.Point(0, 0),
                new PIXI.Point(1, 0),
                new PIXI.Point(2, 0),
                new PIXI.Point(0, 1)
            ],
            [
                new PIXI.Point(0, 0),
                new PIXI.Point(1, 0),
                new PIXI.Point(0, 1),
                new PIXI.Point(1, 1)
            ],
            [
                new PIXI.Point(1, 0),
                new PIXI.Point(2, 0),
                new PIXI.Point(0, 1),
                new PIXI.Point(1, 1)
            ],
            [
                new PIXI.Point(0, 0),
                new PIXI.Point(1, 0),
                new PIXI.Point(2, 0),
                new PIXI.Point(1, 1)
            ],
            [
                new PIXI.Point(0, 0),
                new PIXI.Point(1, 0),
                new PIXI.Point(1, 1),
                new PIXI.Point(1, 2)
            ],
        ];

        protected offsets:PIXI.Point[];
        protected container:PIXI.Container;
        
        public constructor() {
            this.initialise();
        }

        protected createOffsets():PIXI.Point[] {
            return Shape.OFFSETS[Math.floor(Math.random() * Shape.OFFSETS.length)];
        }

        protected createContainer(offsets:PIXI.Point[]):PIXI.Container {
            let container:PIXI.Container = new PIXI.Container();
            for(let offset of offsets) {
                let sprite:PIXI.Sprite = new PIXI.Sprite(shapeTexture);
                sprite.position.x = offset.x * tileW;
                sprite.position.y = offset.y * tileH;
                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;
                container.addChild(sprite);
            }
            return container;
        }

        public initialise():void {
            this.offsets = this.createOffsets();
            if(this.container) {
                application.stage.removeChild(this.container);
            }
            this.container = this.createContainer(this.offsets);
            this.container.position.x = tileW * 3.5;
            this.container.position.y = -tileH * 2.5;
            application.stage.addChild(this.container);            
        }

        public step(grid:PIXI.Sprite[][]):void {
            this.container.position.y += tileH;
            if(this.collide(grid)) {
                this.container.position.y -= tileH;
                this.solidify(grid);
                let rows:number[] = this.getRows();
                this.initialise();
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

            this.container.rotation += Math.PI/2;

            if(this.collide(squares)) {
                this.container.rotation = rotation;
            }
        }

        protected transform(position:PIXI.Point):PIXI.Point {

            const cos_val:number = Math.cos(this.container.rotation);
            const sin_val:number = Math.sin(this.container.rotation);

            // There is probablly a more efficient algorithm for this operation?

            const vertex:PIXI.Point = new PIXI.Point(
                Math.floor(Math.floor(this.container.position.x + (cos_val * position.x - sin_val * position.y)) / tileW),
                Math.floor(Math.floor(this.container.position.y + (sin_val * position.x + cos_val * position.y)) / tileH)
            );
            
            return vertex;
        }
        protected collide(grid:PIXI.Sprite[][]):boolean {
            for(let child of <PIXI.Sprite[]>this.container.children) {
                const position:PIXI.Point = this.transform(<PIXI.Point>child.position);
                // Is the segment out of legal bounds? This constitutes a collision.
                if(position.x < 0 || position.x >= screenW || position.y >= screenH) {
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
                    grid[position.x][position.y].texture = (<PIXI.Sprite>child).texture;
                }
                application.stage.removeChild(child);
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
}

const tileW:number = 16;
const tileH:number = 16;

const screenW:number = 12;
const screenH:number = 20;

let application:PIXI.Application = new PIXI.Application({width: tileW * screenW, height: tileH * screenH});
let shapeTexture:PIXI.Texture;
let squareTexture:PIXI.Texture;
let squares:PIXI.Sprite[][] = [];
let shape:Tetris.Shape;
let interval:number;

PIXI.loader
    .add([
        "images/shape.bmp",
        "images/square.bmp"
    ])
    .load(setup);

function timeStep():void {
    shape.step(squares);
}

function shift(grid:PIXI.Sprite[][], rows:number[]):void {
    rows = rows.sort();
    for(let row of rows) {
        for(let y:number = row; y > 0; y--) {
            for(let x:number = 0; x < screenW; x++) {
                grid[x][y] = grid[x][y - 1];
                grid[x][y].position.y += tileH;
            }
        }
        for(let x:number = 0; x < screenW; x++) {
            grid[x][0] = new PIXI.Sprite(squareTexture);
            grid[x][0].position.x = x * tileW;
            grid[x][0].position.y = y * tileH;
            application.stage.addChild(grid[x][0]);
        }
    }
}

function checkRows(grid:PIXI.Sprite[][], rows:number[]):void {
    let completedRows:number[] = [];
    for(let row of rows) {
        let complete:boolean = true;
        for(let x:number = 0; x < screenW; x++) {
            if(grid[x][row].texture != shapeTexture) {
                complete = false;
                break;
            }
        }
        if(complete) {
            completedRows.push(row);
        }
    }
    completedRows = completedRows.sort((a:number, b:number) => {
        return a > b ? a : b;
    });
    
    // TODO: Remove sprites from stage,
    // add them to a container,
    // make that container blink,
    // while moving above tiles down onto the container.
    // Need to implement ordering for this,
    // and tweening,
    // and method for moving sprites around the grid object.
    if(completedRows.length) {
        clearInterval(interval);
        let blink:PIXI.Container = new PIXI.Container();
        for(let row of completedRows) {
            for(let x:number = 0; x < screenW; x++) {
                const sprite:PIXI.Sprite = grid[x][row];
                application.stage.removeChild(sprite);
                blink.addChild(sprite);
            }
        }
        application.stage.addChild(blink);
        let count:number = 0, blinkInterval:number = setInterval(() => {
            blink.visible = !blink.visible;
            if(!blink.visible && ++count == 5) {
                application.stage.removeChild(blink);
                shift(grid, completedRows);
                clearInterval(blinkInterval);
                interval = window.setInterval(timeStep, 200);
            }
        }, 50);
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
        case 'r':
            shape.rotate(squares);
            break;
    }
};

function setup():void {
    shapeTexture = PIXI.loader.resources['images/shape.bmp'].texture;
    squareTexture = PIXI.loader.resources['images/square.bmp'].texture;
    for(let x:number = 0; x < screenW; x++) {
        squares[x] = [];
        for(let y:number = 0; y < screenH; y++) {
            squares[x][y] = new PIXI.Sprite(squareTexture);
            squares[x][y].position.x = x * tileW;
            squares[x][y].position.y = y * tileH;
            application.stage.addChild(squares[x][y]);  
        }
    }
    shape = new Tetris.Shape();

    interval = window.setInterval(timeStep, 200);
}

document.body.appendChild(application.view);