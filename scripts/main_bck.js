(async () => {
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
        floor: 520,
        player: {
            size: {
                w: 50,
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
    };
    const setBackground = props => {
        ctx.fillRect(props.x, props.y, props.w, props.h);
    }; 
    setDimension(canvas);
    setBackground(dim);
    
    class Sprite
    {
        constructor(props) {
            this.position = props.position;
            this.size = props.size;
            this.image = new Image();
            this.image.src = props.img;
        };
        draw() {
            ctx.drawImage(this.image, this.position.x, this.position.y);
        };
        update() {
            this.draw();
        };
    }

    class Fighter 
    {
        constructor(props) {
            this.position = props.position;
            this.size = props.size;
            this.color = props.color;
            this.velocity = props.velocity;
            this.skills = props.skills;
            this.keysPressed = [];
            this.lastKey = ``;
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
                    this.lightAttackBox.active = true;
                };
            };
        };
        Block() {
            this.AttackBox.position.y = this.AttackBox.blocking.y;
            this.AttackBox.size.w = this.AttackBox.blocking.w;
            this.AttackBox.size.h = this.AttackBox.blocking.h;
        };
        Recover() {
            const speed = 1000 / this.recover.speed;
            this.health = this.health >= this.recover.maxHealth ? this.recover.maxHealth : this.health + (this.recover.health * speed);
            this.mana = this.mana >= this.recover.maxMana ? this.recover.maxMana : this.mana + (this.recover.mana * speed);
        };
        Damage(points) {
            if (this.blocking !== 0) return;
            this.health -= points;
            if (this.health <= 0) {
                console.log(`Enemy0 is dead!`);
                throw new Error(``);
            };
        };
        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);
            ctx.fillStyle = this.lightAttackBox.testColor;
            ctx.fillRect(this.position.x + this.lightAttackBox.position.x, this.position.y + this.lightAttackBox.position.y, this.lightAttackBox.size.w < 1 ? 1 : this.lightAttackBox.size.w, this.lightAttackBox.size.h);
            ctx.fillStyle = this.AttackBox.testColor;
            ctx.fillRect(this.position.x + this.AttackBox.position.x, this.position.y + this.AttackBox.position.y, this.AttackBox.size.w < 1 ? 1 : this.AttackBox.size.w, this.AttackBox.size.h);
        };
        update() {
            timer += (new Date() * 1 - timer);
            document.querySelector(`#player0-health`).value = parseInt(player0.health);
            document.querySelector(`#enemy0-health`).value = parseInt(enemy0.health);
            document.querySelector(`#timer`).innerText = end - timer;
            this.draw();
            this.blocking = this.keysPressed[`b`] ? 1 : 0;
            if (this.blocking === 0) {
                this.AttackBox.position.y = this.AttackBox.initial.y;
                this.AttackBox.size.w = this.AttackBox.initial.w;
                this.AttackBox.size.h = this.AttackBox.initial.h;
            };
            if (this.blocking === 1) {
                this.Block();
            };
            this.velocity.x = (this.lastKey === `ArrowLeft` && this.keysPressed[`ArrowLeft`]) ? (this.velocity.x - this.skills.speed) : (this.lastKey === `ArrowRight` && this.keysPressed[`ArrowRight`]) ? (this.velocity.x + this.skills.speed) : 0;
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

            this.Recover();
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
        img: `./street_01.jpg`
    });

    const player0 = new Fighter({
        position: {
            x: dim.w / 4 * 1,
            y: 0
        },
        size: settings.player.size,
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
                        x: settings.player.size.w,
                        y: 25
                    },
                    size: {
                        w: 0,
                        mw: 64,
                        h: 25
                    },
                    speed: 12.5,
                    damage: 4.8,
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
                speed: 1300,
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
                    speed: 12.5,
                    damage: 4.8,
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
                    damage: 9,
                    testColor: `#994123`
                }
            },
            powercharge: {
                mana: 600,
                duration: 2600
            },
            recover: {
                speed: 1300,
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
                console.log(`Time's up!`);
                // throw new Error(``);
                window.cancelAnimationFrame(animationRef)
            };
            ctx.fillStyle = `rgba(0,0,0,1)`;
            ctx.fillRect(dim.x, dim.y, dim.w, dim.h);

            bg0.update();
            player0.update();
            enemy0.update();

            console.log(enemy0.health);

            if (player0.position.x + player0.size.w < enemy0.position.x) {
                if (player0.position.x + player0.lightAttackBox.position.x + player0.lightAttackBox.size.w > enemy0.position.x) {
                    enemy0.Damage(player0.lightAttackBox.damage);
                };
            }
            else {
                // code for reversed positions here
            };
            setTimeout(() => {
                try {
                    animationRef = window.requestAnimationFrame(animate());
                }
                catch(err) {
                    // console.log(err);
                };
            }, 60_000 / 18_000);
        };
        timer = new Date() * 1;
        end = timer + settings.duration;
        animate();
    };
    
    const handlerKeydown = k => {
        console.log(k)
        switch(k) {
            case `ArrowUp`:
                player0.keysPressed[k] = true;
                player0.Jump();
                break;
            case `ArrowRight`:
                player0.keysPressed[k] = true;
                player0.lastKey = k;
                break;
            case `ArrowLeft`:
                player0.keysPressed[k] = true;
                player0.lastKey = k;
                break;
            case `ArrowDown`:
                player0.keysPressed[k] = true;
                break;
            case `b`:
                player0.keysPressed[k] = true;
                player0.lastKey = k;
                break;
            case ` `:
                player0.keysPressed[k] = true;
                player0.Lightattack();
                break;
            default: break;
        };
    };

    const handlerKeyup = k => {
        switch(k) {
            case `ArrowUp`:
                player0.keysPressed[k] = false;
                break;
            case `ArrowRight`:
                player0.keysPressed[k] = false;
                break;
            case `ArrowLeft`:
                player0.keysPressed[k] = false;
                break;
            case `ArrowDown`:
                player0.keysPressed[k] = false;
                break;
            case `b`:
                player0.keysPressed[k] = false;
                break;
            case ` `:
                player0.keysPressed[k] = false;
                break;
            default: break;
        };
    };

    let animationRef;
    if (typeof window.fight !== 'undefined')
        requestAnimation();
    window.addEventListener(`keydown`, e => handlerKeydown(e.key));    
    window.addEventListener(`keyup`, e => handlerKeyup(e.key));

})();