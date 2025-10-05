const X_VELOCITY = 150
const Y_VELOCITY = 150

class Player {
    constructor({
        position = {
            x: 0,
            y: 0
        },
        size,
        velocity = {
            x: 0,
            y: 0
        }
    }) 
    {   
        this.position = position
        this.width = size
        this.height = size
        this.velocity = velocity
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
        }

        this.loaded = false
        this.image = new Image()
        this.image.onload = () => this.loaded = true
        this.image.src = './images/player.png'
        
        //arma do player
        this.weaponHasLoaded = false
        this.weaponSprite = new Image()
        this.weaponSprite.onload = () => this.weaponHasLoaded = true
        this.weaponSprite.src = './images/lance.png'

        //sprites
        this.currentFrame = 0
        this.elapsedTime = 0
        this.sprites = {
          walkDown: {
            x: 0,
            y: 0,
            width: 16,
            height: 16,
            frameCount: 4
          },
          walkUp: {
            x: 16,
            y: 0,
            width: 16,
            height: 16,
            frameCount: 4
          },
          walkLeft: {
            x: 32,
            y: 0,
            width: 16,
            height: 16,
            frameCount: 4
          },
          walkRight: {
            x: 48,
            y: 0,
            width: 16,
            height: 16,
            frameCount: 4
          },
          attackDown: {
            x: 0,
            y: 64,
            width: 16,
            height: 15,
            frameCount: 1
          },
          attackUp: {
            x: 16,
            y: 64,
            width: 16,
            height: 15,
            frameCount: 1
          },
          attackLeft: {
            x: 32,
            y: 64,
            width: 16,
            height: 15,
            frameCount: 1
          },
          attackRight: {
            x: 48,
            y: 64,
            width: 16,
            height: 15,
            frameCount: 1
          }
        }
        this.currentSprite = this.sprites.walkDown
        this.facing = 'down'
        this.isAttacking = false
        this.attackTimer = 0
        this.attackBoxes = {
          right: {
            xOffset: 10,
            yOffset: 9,
            width: 20,
            height: 5
          },
          left: {
            xOffset: -16,
            yOffset: 9,
            width: 20,
            height: 5
          },
          up: {
            xOffset: 2,
            yOffset: -15,
            width: 5,
            height: 20
          },
          down: {
            xOffset: 2,
            yOffset: 10,
            width: 5,
            height: 20
          }
        }

        this.attackBox = {
          x: this.position.x + this.attackBoxes[this.facing].xOffset,
          y: this.position.y + this.attackBoxes[this.facing].yOffset,
          width: this.attackBoxes[this.facing].width,
          height: this.attackBoxes[this.facing].height
        }

        this.hasHitEnemy = false
        this.isInvincible = false
        this.elapsedInvincibleTime = 0
        this.invincibleInterval = .8
    }

    //player recebe dano
    receiveHit() {
      if(this.isInvincible) return
      this.isInvincible = true
  }

    //mudando o sprite para a posição original após atacar
    switchBackToIdleState() {
      switch(this.facing) {
        case 'down':
          this.currentSprite = this.sprites.walkDown
          break
        case 'up':
          this.currentSprite = this.sprites.walkUp
          break
        case 'right':
          this.currentSprite = this.sprites.walkRight
          break
        case 'left':
          this.currentSprite = this.sprites.walkLeft
          break
      }
    }

    //ataque do player
    attack() {
      switch(this.facing) {
        case 'down':
          this.currentSprite = this.sprites.attackDown
          break
        case 'up':
          this.currentSprite = this.sprites.attackUp
          break
        case 'right':
          this.currentSprite = this.sprites.attackRight
          break
        case 'left':
          this.currentSprite = this.sprites.attackLeft
          break
      }
      this.currentFrame = 0
      this.isAttacking = true
    }

    draw(c) {
        if(!this.loaded || !this.weaponHasLoaded) return

        //red square debug code
        // c.fillStyle = 'rgba(0, 0, 255, 0.5)'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        //attack box debug code
        // c.fillStyle = 'rgba(0, 0, 255, 0.5)'
        // c.fillRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height)

        // const cropbox = { x: 0, y: 0, width: 16, height: 16 }

        let alpha = 1
        if(this.isInvincible) alpha = .5
        c.save()
        c.globalAlpha = alpha
        //desenhando o player
        c.drawImage(
          this.image,
          this.currentSprite.x,
          this.currentSprite.y + this.currentSprite.height * this.currentFrame + .5,
          this.currentSprite.width,
          this.currentSprite.height,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        )
        c.restore()

        let weapon = {
          x: -3,
          y: -8,
          width: 6,
          height: 16
        }

        if(this.isAttacking) {
          let angle = 0
          let xOffset = 0
          let yOffset = 0
          switch(this.facing) {
            case 'down':
              angle = 0
              xOffset = 5
              yOffset = 22
              break
            case 'up':
              angle = Math.PI
              xOffset = 4
              yOffset = -7
              break
            case 'right':
              angle = (Math.PI * 3) / 2
              xOffset = 22
              yOffset = 11
              break
            case 'left':
              angle = Math.PI / 2
              xOffset = -8
              yOffset = 12
              break
          }
 
          //desenhando a arma
          c.save()
          c.globalAlpha = alpha
          c.translate(this.position.x + xOffset, this.position.y + yOffset)
          c.rotate(angle)
          c.drawImage(
            this.weaponSprite,
            weapon.x,
            weapon.y,
            weapon.width,
            weapon.height
          )
          c.restore()
        }
    }

    update(deltaTime, collisionBlocks) {
        if(!deltaTime) return

        //atualizando o timer de ataque
        const ATTACK_TIME = .3
        if(this.isAttacking && this.attackTimer < ATTACK_TIME) this.attackTimer += deltaTime
        else if(this.isAttacking && this.attackTimer >= ATTACK_TIME) {
          this.isAttacking = false
          this.attackTimer = 0
          this.switchBackToIdleState()
          this.hasHitEnemy = false
        }

        this.elapsedTime += deltaTime

        if(this.isInvincible) {
          this.elapsedInvincibleTime += deltaTime
          if(this.elapsedInvincibleTime >= this.invincibleInterval) {
              this.isInvincible = false
              this.elapsedInvincibleTime = 0
          }
        }

        const INTERVAL_TO_NEXT_FRAME = .15
        //0 - 3
        if(this.elapsedTime > INTERVAL_TO_NEXT_FRAME) {
          this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frameCount
          this.elapsedTime -= INTERVAL_TO_NEXT_FRAME
        }

        //atualizando posição e colisão horizontal
        this.updateHorizontalPosition(deltaTime)
        this.checkForHorizontalCollisions(collisionBlocks)

        //atualizando posição e colisão vertical
        this.updateVerticalPosition(deltaTime)
        this.checkForVerticalCollisions(collisionBlocks)

        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
        }

        this.attackBox = {
          x: this.position.x + this.attackBoxes[this.facing].xOffset,
          y: this.position.y + this.attackBoxes[this.facing].yOffset,
          width: this.attackBoxes[this.facing].width,
          height: this.attackBoxes[this.facing].height
        }
    }

    updateHorizontalPosition(deltaTime) {
        this.position.x += this.velocity.x * deltaTime
    }

    updateVerticalPosition(deltaTime) {
        this.position.y += this.velocity.y * deltaTime
    }

    handleInput(keys) {
        this.velocity.x = 0
        this.velocity.y = 0

        if(this.isAttacking) return
    
        if(keys.d.pressed) {
          this.velocity.x = X_VELOCITY
          this.currentSprite = this.sprites.walkRight
          this.currentSprite.frameCount = 4
          this.facing = 'right'
        } 
        else if(keys.a.pressed) {
          this.velocity.x = -X_VELOCITY
          this.currentSprite = this.sprites.walkLeft
          this.currentSprite.frameCount = 4
          this.facing = 'left'
        } 
        else if(keys.w.pressed) {
          this.velocity.y = -Y_VELOCITY
          this.currentSprite = this.sprites.walkUp
          this.currentSprite.frameCount = 4
          this.facing = 'up'
        }
        else if(keys.s.pressed) {
          this.velocity.y = Y_VELOCITY
          this.currentSprite = this.sprites.walkDown
          this.currentSprite.frameCount = 4
          this.facing = 'down'
        }
        else {
          this.currentSprite.frameCount = 1
        }
    }

    checkForHorizontalCollisions(collisionBlocks) {
        const buffer = 0.0001
        for (let i = 0; i < collisionBlocks.length; i++) {
          const collisionBlock = collisionBlocks[i]
          // Check if a collision exists on all axes
          if(
            this.position.x <= collisionBlock.position.x + collisionBlock.width &&
            this.position.x + this.width >= collisionBlock.position.x &&
            this.position.y + this.height >= collisionBlock.position.y &&
            this.position.y <= collisionBlock.position.y + collisionBlock.height
          ){
            // Check collision while player is going left
            if(this.velocity.x < -0) {
                this.position.x = collisionBlock.position.x + collisionBlock.width + buffer
                break
            }
            // Check collision while player is going right
            if(this.velocity.x > 0) {
                this.position.x = collisionBlock.position.x - this.width - buffer
                break
            }
          }
        }
    }

    checkForVerticalCollisions(collisionBlocks) {
        const buffer = 0.0001
        for (let i = 0; i < collisionBlocks.length; i++) {
          const collisionBlock = collisionBlocks[i]
    
          // If a collision exists
          if (
            this.position.x <= collisionBlock.position.x + collisionBlock.width &&
            this.position.x + this.width >= collisionBlock.position.x &&
            this.position.y + this.height >= collisionBlock.position.y &&
            this.position.y <= collisionBlock.position.y + collisionBlock.height
          ){
            // Check collision while player is going up
            if(this.velocity.y < 0) {
                this.velocity.y = 0
                this.position.y = collisionBlock.position.y + collisionBlock.height + buffer
                break
            }
    
            // Check collision while player is going down
            if(this.velocity.y > 0) {
                this.velocity.y = 0
                this.position.y = collisionBlock.position.y - this.height - buffer
                break
            }
          }
        }
    }
}