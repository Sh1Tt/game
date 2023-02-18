(async () => {
    const controls = {
        player: {
            up: `w`,
            down: `s`,
            left: `a`,
            right: `d`,
            attack: `v`,
            block: `b`
        },
        enemy: {
            up: `ArrowUp`,
            down: `ArrowDown`,
            left: `ArrowLeft`,
            right: `ArrowRight`,
            attack: `2`,
            block: `3`
        }
    };

    const stdout = {};
    stdout.timer = document.body.querySelector(`#timer`);
    stdout.gamebar = document.body.querySelector(`#bar`);
    stdout.player = document.body.querySelector(`#player0-health`);
    stdout.enemy = document.body.querySelector(`#enemy0-health`);
    stdout.gameover = document.body.querySelector(`#game-over`);
    stdout.buttons = document.body.querySelector(`#controls`);

    stdout.controls = {
        player0: {
            up: document.body.querySelector(`#player0-up`),
            down: document.body.querySelector(`#player0-down`),
            left: document.body.querySelector(`#player0-left`),
            right: document.body.querySelector(`#player0-right`),
            attack: document.body.querySelector(`#player0-attack`),
            block: document.body.querySelector(`#player0-block`)
        },
        enemy0: {
            up: document.body.querySelector(`#enemy0-up`),
            down: document.body.querySelector(`#enemy0-down`),
            left: document.body.querySelector(`#enemy0-left`),
            right: document.body.querySelector(`#enemy0-right`),
            attack: document.body.querySelector(`#enemy0-attack`),
            block: document.body.querySelector(`#enemy0-block`)
        }
    };

    stdout.controls.player0.up.innerText = controls.player.up;
    stdout.controls.player0.down.innerText = controls.player.down;
    stdout.controls.player0.left.innerText = controls.player.left;
    stdout.controls.player0.right.innerText = controls.player.right;
    stdout.controls.player0.attack.innerText = controls.player.attack;
    stdout.controls.player0.block.innerText = controls.player.block;

    stdout.controls.enemy0.up.innerText = controls.enemy.up;
    stdout.controls.enemy0.down.innerText = controls.enemy.down;
    stdout.controls.enemy0.left.innerText = controls.enemy.left;
    stdout.controls.enemy0.right.innerText = controls.enemy.right;
    stdout.controls.enemy0.attack.innerText = controls.enemy.attack;
    stdout.controls.enemy0.block.innerText = controls.enemy.block;

    const canvas = document.body.querySelector(`#canvas-0`);
    const ctx = canvas.getContext(`2d`);
    const settings = {
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 1280,
            height: 692 
        },
        floor: 500,
        player: {
            size: {
                w: 150,
                h: 150  
            }
        },
        gravity: 0.15,
        duration: 30_000
    };
    const dim = {};
    let timer, end;
    
    const setDimension = target => {
        const { min, max } = settings;
        dim.x = 0;
        dim.y = 0;
        dim.w = window.innerWidth <= min.width ? min.width 
            : (window.innerWidth > max.width ? max.width 
                : window.innerWidth);
        dim.h = window.innerHeight <= min.height ? min.height 
            : (window.innerHeight > max.height ? max.height 
                : window.innerHeight);
        target.width = dim.w;
        target.height = dim.h;
        stdout.gamebar.style.width = `${dim.w}px`;
        stdout.gameover.style.width = `${dim.w}px`;
        stdout.gameover.style.height = `${dim.h}px`;
        stdout.buttons.style.width = `${dim.w}px`;
    };
    const setBackground = props => {
        ctx.fillRect(props.x, props.y, props.w, props.h);
    }; 
    setDimension(canvas);
    setBackground(dim);
    
    class Sprite {
        constructor(props) {
            this.position = props.position;
            this.size = props.size;
            this.image = new Image();
            this.image.src = props.img;
            this.imgW = props.imgW;
            this.scale = props.scale;
            this.framesMax = props.framesMax;
            this.framesCurrent = props.framesCurrent || 0;
            this.framesElapsed = 0;
            this.framesHold = 12;
            this.spriteFrame = 0;
        };
        draw() {
            ctx.drawImage(
                this.image,
                this.framesCurrent * (this.imgW / this.framesMax),
                0,
                this.image.width / this.framesMax,
                this.image.height,
                this.position.x,
                this.position.y,
                this.size.w * this.scale,
                this.size.h * this.scale
            );
        };
        animateFrames() {
            this.framesElapsed++;

            if (this.framesElapsed % this.framesHold === 0) {
                this.spriteFrame++;
                if (this.framesCurrent < this.framesMax - 1) {
                    this.framesCurrent++;
                }
                else {
                    this.framesCurrent = 0;
                }
            }
        };

        update() {
            this.draw();
            this.animateFrames();
        };
    }

    class Fighter extends Sprite {
        constructor(props) {
            super({
                position: props.position,
                size: props.size,
                img: props.img,
                imgW: props.imgW,
                scale: props.scale,
                framesMax: props.framesMax
            });
            this.color = props.color;
            this.velocity = props.velocity;
            this.skills = props.skills;
            this.keysPressed = [];
            this.lastKey = ``;
            this.isBlocking = false;
            this.lightAttackBox = {
                position: {
                    x: props.skills.attack.light.position.x,
                    y: props.skills.attack.light.position.y
                },
                size: props.skills.attack.light.size,
                speed: props.skills.attack.light.speed,
                damage: props.skills.attack.light.damage,
                testColor: props.skills.attack.light.testColor,
                active: false
            };
            this.AttackBox = {
                position: {
                    x: props.skills.attack.full.position.x,
                    y: props.skills.attack.full.position.y
                },
                size: props.skills.attack.full.size,
                speed: props.skills.attack.full.speed,
                damage: props.skills.attack.full.damage,
                testColor: props.skills.attack.full.testColor,
                blocking: {
                    y: props.position.y + props.skills.blocking.y,
                    w: props.size.w + props.skills.blocking.w,
                    h: props.skills.blocking.h
                },
                initial: {
                    y: props.skills.attack.full.position.y,
                    w: props.skills.attack.full.size.w,
                    h: props.skills.attack.full.size.h
                },
                active: false
            };
            this.health = props.skills.health;
            this.mana = props.skills.mana;
            this.recover = props.skills.recover;
            this.blocking = 0;
            this.sprites = props.sprites;

            console.log(this.sprites);

            for (const key in this.sprites) {
                this.sprites[key].image = new Image();
                this.sprites[key].image.width = this.sprites[key].imgW;
                this.sprites[key].image.src = this.sprites[key].img;
            };

            console.log(this.sprites);
        };
        Jump() {
            if (this.velocity.y < 0.01 && this.velocity.y > -0.01) {
                this.velocity.y += -7.5;
            };
        };
        Lightattack() {
            if (
                this.lightAttackBox.size.w <= 1
                &&
                this.blocking === 0
            ) {
                if (!this.lightAttackBox.active)  {
                    this.isAttacking = true;
                    this.lightAttackBox.active = true;
                    this.image = this.sprites.attack.image;
                    this.imgW = this.sprites.attack.imgW;
                    this.framesMax = this.sprites.attack.framesMax;
                };
            };
        };
        Block() {
            this.isBlocking = true;
            console.log("Blocking!");
            this.AttackBox.position.y = this.AttackBox.blocking.y;
            this.AttackBox.size.w = this.AttackBox.blocking.w;
            this.AttackBox.size.h = this.AttackBox.blocking.h;
            this.image = this.sprites.block.image;
            this.imgW = this.sprites.block.imgW;
            this.framesMax = this.sprites.block.framesMax;
        };
        Recover() {
            if (!this.lightAttackBox.active
                &&
                !this.isBlocking
            ) {
                const speed = 500 / this.recover.speed;
                this.health = this.health >= this.recover.maxHealth ? this.recover.maxHealth : this.health + (this.recover.health * speed);
                this.mana = this.mana >= this.recover.maxMana ? this.recover.maxMana : this.mana + (this.recover.mana * speed);
            }
        };
        Damage(points) {
            if (this.blocking !== 0) 
                return;
            switch(this) {
                case player0:
                    enemy0.isAttacking = false;
                    break;
                case enemy0:
                    player0.isAttacking = false;
                    break;
            };
            this.health -= points;
            this.image = this.sprites.damage.image;
            this.imgW = this.sprites.damage.imgW;
            this.framesMax = this.sprites.damage.framesMax;
            if (this.health <= 0) {
                stdout.gameover.style.visibility = `visible`;
                stdout.gameover.innerHTML = `
                    <h2>
                        Game Over
                    </h2>
                    <h2>
                        Player ${this === player0 ? "2" : "1"} wins!
                    </h2>
                    <p>
                        Press F5 to restart
                    </p>
                `;
                throw new Error(``);
            };
        };
        // draw() {
        //     ctx.fillStyle = this.color;
        //     ctx.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);
        //     ctx.fillStyle = this.lightAttackBox.testColor;
        //     ctx.fillRect(this.position.x + this.lightAttackBox.position.x, this.position.y + this.lightAttackBox.position.y, this.lightAttackBox.size.w < 1 ? 1 : this.lightAttackBox.size.w, this.lightAttackBox.size.h);
        //     ctx.fillStyle = this.AttackBox.testColor;
        //     ctx.fillRect(this.position.x + this.AttackBox.position.x, this.position.y + this.AttackBox.position.y, this.AttackBox.size.w < 1 ? 1 : this.AttackBox.size.w, this.AttackBox.size.h);
        // };
        update() {
            timer += (new Date() * 1 - timer);
            const t = (end - timer) < 0 ? 0 : (end - timer);
            stdout.player.value = parseInt(player0.health);
            stdout.enemy.value = parseInt(enemy0.health);
            stdout.timer.innerText = t.toString().slice(0, 2);
            this.draw();
            this.animateFrames();

            this.blocking = (
                this.keysPressed[controls.player.block]
                || 
                this.keysPressed[controls.enemy.block]
            ) ? 1 
            : 0;
            if (this.blocking === 0) {
                this.AttackBox.position.y = this.AttackBox.initial.y;
                this.AttackBox.size.w = this.AttackBox.initial.w;
                this.AttackBox.size.h = this.AttackBox.initial.h;
            };
            if (this.blocking === 1) {
                this.Block();
            };
            this.velocity.x = ((
                this.lastKey === controls.player.left
                ||
                this.lastKey === controls.enemy.left
             ) && (
                this.keysPressed[controls.player.left]
                ||
                this.keysPressed[controls.enemy.left]
            )) ? (this.velocity.x - this.skills.speed) : ((
                this.lastKey === controls.player.right
                ||
                this.lastKey === controls.enemy.right
            ) && (
                this.keysPressed[controls.player.right]
                ||
                this.keysPressed[controls.enemy.right]
            )) ? (this.velocity.x + this.skills.speed)
            : 0;
            this.velocity.x = (this.velocity.x >= this.skills.maxSpeed) ? this.skills.maxSpeed : (this.velocity.x <= (this.skills.maxSpeed * -1)) ? this.skills.maxSpeed * -1 : this.velocity.x;
            this.position.x += this.velocity.x;

            // change this for bounceback
            this.position.x = (this.position.x + this.velocity.x) < dim.x ? dim.x : (this.position.x + this.size.w + this.velocity.x) >= dim.w ? (dim.w - this.size.w) : this.position.x;
            
            this.velocity.y = this.position.y + this.size.h + this.velocity.y < settings.floor ? ( this.velocity.y + settings.gravity) : 0; 
            this.position.y += this.velocity.y;

            if (this.lightAttackBox.active) {
                console.log(`Attack!!`);
                this.lightAttackBox.size.w += this.lightAttackBox.speed;
            }
            else if (this.lightAttackBox.size.w > 0) {
                this.lightAttackBox.size.w -= this.lightAttackBox.speed;
            };
            if (this.lightAttackBox.size.w  >= 50) {
                this.lightAttackBox.active = false;
            };
            if (this.lightAttackBox.size.w <= 0) {
                this.lightAttackBox.size.w = 0;
            };

            if (!this.isBlocking && !this.lightAttackBox.active)
                this.Recover();
            
            if (this.spriteFrame === this.framesMax) {
                this.spriteFrame = 0;
                this.image = this.sprites.idle.image;
                this.imgW = this.sprites.idle.imgW;
                this.framesMax = this.sprites.idle.framesMax;
            };
        };
    }   
    const bg0 = new Sprite({
        position: {
            x: dim.x,
            y: dim.y
        },
        size: {
            w: dim.w,
            h: dim.h
        },
        img: `./sky.png`,
        imgW: dim.w,
        framesMax: 1,
        scale: 1
    });

    const player0 = new Fighter({
        position: {
            x: dim.w / 4 * 1,
            y: 0
        },
        size: settings.player.size,
        img: `./sword/idle.png`,
        imgW: `1200`,
        framesMax: 4,
        scale: 1,
        sprites: {
            idle: {
                img: `./sword/idle.png`,
                imgW: 1200,
                framesMax: 4,
            },
            run: {
                img: `./sword/idle.png`,
                imgW: 1200,
                framesMax: 4,
            },
            lightattack: {
                img: `./sword/attack.png`,
                imgW: 1800,
                framesMax: 6,
            },
            attack: {
                img: `./sword/attack.png`,
                imgW: 1800,
                framesMax: 6,
            },
            block: {
                img: `./sword/block.png`,
                imgW: 1200,
                framesMax: 4,
            },
            damage: {
                img: `./sword/damage.png`,
                imgW: 1200,
                framesMax: 4,
            }
        },
        velocity: {
            x: 0,
            y: 0
        },
        color: `#ff3000`,
        skills: {
            speed: 0.036,
            maxSpeed: 3.25,
            blocking: {
                y: 17.5,
                w: 8,
                h: 62
            },
            attack: {
                light: {
                    position: {
                        x: settings.player.size.w / 2,
                        y: 50
                    },
                    size: {
                        w: 0,
                        mw: settings.player.size.w / 2 + 12,
                        h: 25
                    },
                    speed: 102.5,
                    damage: 6.8,
                    testColor: `#20fb23`
                },
                full: {
                    position: {
                        x: 0,
                        y: 28
                    },
                    size: {
                        w: 0,
                        mw: 100,
                        h: 37
                    },
                    speed: 6.75,
                    damage: 9,
                    testColor: `#ffffff`
                }
            },
            powercharge: {
                mana: 600,
                duration: 2600
            },
            recover: {
                speed: 5000,
                health: 0.75,
                maxHealth: 100,
                mana: 3,
                maxMana: 900 
            },
            health: 100,
            mana: 0
        }
    });

    const enemy0 = new Fighter({
        position: {
            x: (dim.w / 4 * 3) - settings.player.size.w,
            y: 0
        },
        size: settings.player.size,
        img: `./headphones/idle.png`,
        imgW: 1200,
        framesMax: 4,
        scale: 1,
        sprites: {
            idle: {
                img: `./headphones/idle.png`,
                imgW: 1200,
                framesMax: 4,
            },
            run: {
                img: `./headphones/idle.png`,
                imgW: 1200,
                framesMax: 4,
            },
            lightattack: {
                img: `./headphones/idle.png`,
                imgW: 1200,
                framesMax: 4,
            },
            attack: {
                img: `./headphones/attack.png`,
                imgW: 1200,
                framesMax: 4,
            },
            block: {
                img: `./headphones/block.png`,
                imgW: 1200,
                framesMax: 4,
            },
            damage: {
                img: `./headphones/hit.png`,
                imgW: 1200,
                framesMax: 4,
            }

        },
        velocity: {
            x: 0,
            y: 0
        },
        color: `#ff8000`,
        skills: {
            speed: 0.036,
            maxSpeed: 3.25,
            blocking: {
                y: 17.5,
                w: 8,
                h: 62
            },
            attack: {
                light: {
                    position: {
                        x: settings.player.size.w,
                        y: 25
                    },
                    size: {
                        w: 0,
                        mw: 64,
                        h: 25
                    },
                    speed: 60.5,
                    damage: 6.1,
                    testColor: `#33ae80`
                },
                full: {
                    position: {
                        x: 0,
                        y: 28
                    },
                    size: {
                        w: 0,
                        mw: 100,
                        h: 37.5
                    },
                    speed: 6.75,
                    damage: 12,
                    testColor: `#994123`
                }
            },
            powercharge: {
                mana: 600,
                duration: 2600
            },
            recover: {
                speed: 5000,
                health: 0.75,
                maxHealth: 100,
                mana: 3,
                maxMana: 900 
            },
            health: 100,
            mana: 0
        }
    });
    
    function requestAnimation() {
        const animate = () => {
            if (timer > end) {
                stdout.gameover.style.visibility = `visible`;
                stdout.gameover.innerHTML = `
                    <h2>
                        Time's up!
                    </h2>
                    <p>
                        Press F5 to restart
                    </p>
                `;
                throw new Error(``);
            };
            ctx.fillStyle = `rgba(0,0,0,1)`;
            ctx.fillRect(dim.x, dim.y, dim.w, dim.h);

            bg0.update();
            player0.update();
            enemy0.update();

            if (player0.position.x < enemy0.position.x) {
                if (player0.isAttacking && player0.position.x + player0.lightAttackBox.position.x + player0.lightAttackBox.size.w > enemy0.position.x) {
                    enemy0.Damage(player0.lightAttackBox.damage);
                }
                else if (enemy0.isAttacking && enemy0.position.x - enemy0.lightAttackBox.size.w < player0.position.x + player0.size.w) {
                    player0.Damage(enemy0.lightAttackBox.damage);
                }
            }
            else {
                
            };





            setTimeout(() => {
                try {
                    // window.requestAnimationFrame(animate());
                    animate();
                }
                catch(err) {
                    console.log(err);
                };
            }, 1);
        };
        timer = new Date() * 1;
        end = timer + settings.duration;
        animate();
    };
    
    const handlerKeydown = k => {
        switch(k) {
            case controls.player.up:
                player0.keysPressed[k] = true;
                player0.Jump();
                break;
            case controls.player.right:
                player0.keysPressed[k] = true;
                player0.lastKey = k;
                break;
            case controls.player.left:
                player0.keysPressed[k] = true;
                player0.lastKey = k;
                break;
            case controls.player.down:
                player0.keysPressed[k] = true;
                break;
            case controls.player.block:
                player0.keysPressed[k] = true;
                player0.lastKey = k;
                break;
            case controls.player.attack:
                player0.keysPressed[k] = true;
                player0.Lightattack();
                break;

            case controls.enemy.up:
                enemy0.keysPressed[k] = true;
                enemy0.Jump();
                break;
            case controls.enemy.right:
                enemy0.keysPressed[k] = true;
                enemy0.lastKey = k;
                break;
            case controls.enemy.left:
                enemy0.keysPressed[k] = true;
                enemy0.lastKey = k;
                break;
            case controls.enemy.down:
                enemy0.keysPressed[k] = true;
                break;
            case controls.enemy.block:
                enemy0.keysPressed[k] = true;
                enemy0.lastKey = k;
                break;
            case controls.enemy.attack:
                enemy0.keysPressed[k] = true;
                enemy0.Lightattack();
                break;
    
            default: break;
        };
    };

    const handlerKeyup = k => {
        switch(k) {
            case controls.player.up:
                player0.keysPressed[k] = false;
                break;
            case controls.player.right:
                player0.keysPressed[k] = false;
                break;
            case controls.player.left:
                player0.keysPressed[k] = false;
                break;
            case controls.player.down:
                player0.keysPressed[k] = false;
                break;
            case controls.player.block:
                player0.isBlocking = false;
                player0.keysPressed[k] = false;
                break;
            case controls.player.attack:
                player0.keysPressed[k] = false;
                player0.isAttacking = false;
                break;
            
            case controls.enemy.up:
                enemy0.keysPressed[k] = false;
                break;
            case controls.enemy.right:
                enemy0.keysPressed[k] = false;
                break;
            case controls.enemy.left:
                enemy0.keysPressed[k] = false;
                break;
            case controls.enemy.down:
                enemy0.keysPressed[k] = false;
                break;
            case controls.enemy.block:
                enemy0.isBlocking = false;
                enemy0.keysPressed[k] = false;
                break;
            case controls.enemy.attack:
                enemy0.keysPressed[k] = false;
                enemy0.isAttacking = false;
                break;
            default: break;
        };
    };

    
    requestAnimation();
    window.addEventListener(`keydown`, e => handlerKeydown(e.key));    
    window.addEventListener(`keyup`, e => handlerKeyup(e.key));
})();