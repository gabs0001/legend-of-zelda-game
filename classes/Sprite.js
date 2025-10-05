class Sprite {
    constructor({
        position = {
            x: 0,
            y: 0
        },
        imageSrc = './images/leaf.png',
        velocity
    })
    {   
        this.position = position
        this.width = 12
        this.height = 7
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
        }

        this.loaded = false
        this.image = new Image()
        this.image.onload = () => this.loaded = true
        this.image.src = imageSrc
        this.currentFrame = 0
        this.currentSprite = {
            x: 0,
            y: 0,
            width: 12,
            height: 7,
            frameCount: 6
        }
        this.elapsedTime = 0
        this.velocity = velocity
        this.alpha = 1
        this.totalElapsedTime = 0
    }

    draw(c) {
        if(!this.loaded) return

        c.save()
        c.globalAlpha = this.alpha
        //desenhando o player
        c.drawImage(
          this.image,
          this.currentSprite.x + this.currentSprite.width * this.currentFrame,
          this.currentSprite.y,
          this.currentSprite.width,
          this.currentSprite.height,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        )
        c.restore()
    }

    update(deltaTime) {
        if(!deltaTime) return

        this.elapsedTime += deltaTime
        this.totalElapsedTime += deltaTime
        const INTERVAL_TO_NEXT_FRAME = .15

        if(this.elapsedTime > INTERVAL_TO_NEXT_FRAME) {
          this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frameCount
          this.elapsedTime -= INTERVAL_TO_NEXT_FRAME
        }

        //atualizando a posição do sprite
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        //atualizando opacidade das folhas
        const LEAF_LIFE_INTERVAL = 15
        if(this.totalElapsedTime > LEAF_LIFE_INTERVAL) {
            this.alpha -= 0.01
            this.alpha = Math.max(0, this.alpha)
        }
    }
}