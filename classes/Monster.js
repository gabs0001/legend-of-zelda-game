class Monster {
    constructor({
        position = {
            x: 0,
            y: 0
        },
        size,
        velocity = {
            x: 0,
            y: 0
        },
        imageSrc,
        sprites,
        health = 3
    }) 
    {   
        this.position = position
        this.originalPosition = {
            x: this.position.x,
            y: this.position.y
        }
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
        this.image.src = imageSrc
        this.currentFrame = 0
        this.elapsedTime = 0
        this.elapsedMovementTime = 0
        this.sprites = sprites
        this.currentSprite = Object.values(this.sprites)[0]
        this.health = health
        this.isInvincible = false
        this.elapsedInvincibleTime = 0
        this.invincibleInterval = .4
    }

    //inimigo recebe dano
    receiveHit() {
        if(this.isInvincible) return
        this.health--
        this.isInvincible = true
    }

    draw(c) {
        if(!this.loaded) return

        //red square debug code
        // c.fillStyle = 'rgba(0, 0, 255, 0.5)'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        // const cropbox = { x: 0, y: 0, width: 16, height: 16 }

        let alpha = 1
        if(this.isInvincible) alpha = .5
        c.save()
        c.globalAlpha = alpha
        //desenhando o monstro
        c.drawImage(
          this.image,
          this.currentSprite.x,
          this.currentSprite.height * this.currentFrame + .5,
          this.currentSprite.width,
          this.currentSprite.height,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        )
        c.restore()
    }

    update(deltaTime, collisionBlocks) {
        if(!deltaTime) return

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

        //definindo um lugar aleatório para posicionar o inimigo
        this.setVelocity(deltaTime)

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
    }

    //movendo o inimigo pra posições aleatórias a cada intervalo de tempo
    setVelocity(deltaTime) {
        const CHANGE_INTERVAL = 1
        if(this.elapsedMovementTime > CHANGE_INTERVAL || this.elapsedMovementTime === 0) {
            this.elapsedMovementTime -= CHANGE_INTERVAL

            //gerando um valor entre 0 e 6.28 radianos
            const angle = Math.random() * Math.PI * 2
            const CIRCLE_RADIUS = 15
            
            //definindo uma nova posição para o inimigo e atribuindo uma velocidade
            const targetLocation = {
                x: this.originalPosition.x + Math.cos(angle) * CIRCLE_RADIUS,
                y: this.originalPosition.y + Math.sin(angle) * CIRCLE_RADIUS,
            }

            const deltaX = targetLocation.x - this.position.x
            const deltaY = targetLocation.y - this.position.y

            const hypotenuse = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
            const normalizedDeltaX = deltaX / hypotenuse //aprox. 0.6
            const normalizedDeltaY = deltaY / hypotenuse //aprox. 0.4

            this.velocity.x = normalizedDeltaX * CIRCLE_RADIUS
            this.velocity.y = normalizedDeltaY * CIRCLE_RADIUS
        }

        this.elapsedMovementTime += deltaTime
    }

    updateHorizontalPosition(deltaTime) {
        this.position.x += this.velocity.x * deltaTime
    }

    updateVerticalPosition(deltaTime) {
        this.position.y += this.velocity.y * deltaTime
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
            // Check collision while monster is going left
            if(this.velocity.x < -0) {
                this.position.x = collisionBlock.position.x + collisionBlock.width + buffer
                this.velocity.x = -this.velocity.x
                break
            }
            // Check collision while monster is going right
            if(this.velocity.x > 0) {
                this.position.x = collisionBlock.position.x - this.width - buffer
                this.velocity.x = -this.velocity.x
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
            // Check collision while monster is going up
            if(this.velocity.y < 0) {
                this.position.y = collisionBlock.position.y + collisionBlock.height + buffer
                this.velocity.y = -this.velocity.y
                break
            }
            // Check collision while monster is going down
            if(this.velocity.y > 0) {
                this.position.y = collisionBlock.position.y - this.height - buffer
                this.velocity.y = -this.velocity.y
                break
            }
          }
        }
    }
}