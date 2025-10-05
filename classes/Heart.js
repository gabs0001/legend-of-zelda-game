class Heart {
    constructor({
        position = {
            x: 0,
            y: 0
        }
    }) 
    {   
        this.position = position
        this.width = 20
        this.height = 20
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
        }

        this.loaded = false
        this.image = new Image()
        this.image.onload = () => this.loaded = true
        this.image.src = './images/heart.png'
        this.currentFrame = 4
        this.currentSprite = {
            x: 0,
            y: 0,
            width: 16,
            height: 16,
            frameCount: 4
        }
    }

    draw(c) {
        if(!this.loaded) return

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

    }
}