document.addEventListener("DOMContentLoaded", function() {
    const gameContainer = document.querySelector('.game-container');

    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        physics: {
            default: 'arcade',
            arcade: {
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        parent: gameContainer
    };

    const game = new Phaser.Game(config);

    let player;
    let cursors;
    let obstacles;
    let scoreText;
    let platform;
    let nextObstacleTime = 0;
    let score = 0; // Initialize score variable
    let starCounter = 0; // Initialize star counter
    const obstacleDelay = 2000;
    const zombieSpeed = 100;

    function preload() {
        this.load.image('player', 'img/ct.png');
        this.load.image('zombie', 'img/zombie.png');
        this.load.image('bk', 'img/bk.jpg');
        this.load.image('star', 'img/star.png'); // Load star image
    }

    function create() {
        // Create a background
        this.add.image(0, 0, 'bk').setOrigin(0).setDisplaySize(window.innerWidth, window.innerHeight);

        // Create a platform
        platform = this.physics.add.staticGroup();
        platform.create(window.innerWidth / 2, window.innerHeight - 10, null).setDisplaySize(window.innerWidth, 20).refreshBody();
        platform.children.iterate(function(child) {
            child.setAlpha(0);  // Set platform to be invisible
        });

        // Create player
        player = this.physics.add.sprite(100, window.innerHeight - 140, 'player');
        player.setCollideWorldBounds(true);
        player.body.setSize(40, 80);
        player.setGravityY(800);

        // Enable arrow key movement
        cursors = this.input.keyboard.createCursorKeys();

        // Allow player to jump with the upper arrow key
        this.input.keyboard.on('keydown-UP', function() {
            if (player.body.touching.down) {
                player.setVelocityY(-750); // Increased jump height
            }
        });

        // Create obstacles group
        obstacles = this.physics.add.group();

        // Display score
        scoreText = this.add.text(16, 16, 'Zombies Survived: 0', { fontSize: '32px', fill: '#fff' });

        // Add collision between player and obstacles
        this.physics.add.collider(player, obstacles, gameOver, null, this);
        this.physics.add.collider(player, platform);
        this.physics.add.collider(obstacles, platform);

        // Create initial obstacle
        createObstacle();
    }

    function update(time) {
        // Spawn obstacles
        if (time > nextObstacleTime) {
            createObstacle();
            nextObstacleTime = time + obstacleDelay;
        }

        // Move obstacles
        obstacles.getChildren().forEach(function(obstacle) {
            obstacle.x -= zombieSpeed / 60;

            if (obstacle.x + obstacle.width < 0) {
                obstacle.destroy();
                // Increment score when zombie passes
                score++;
                updateScoreText();
            }
        });

        // Player movement
        if (cursors.left.isDown) {
            player.setVelocityX(-200);
        } else if (cursors.right.isDown) {
            player.setVelocityX(200);
        } else {
            player.setVelocityX(0);
        }

        // Check for star appearance
        if (score > 0 && score % 10 === 0 && score / 10 > starCounter) {
            createStar();
            starCounter++;
        }
    }

    function createObstacle() {
        const obstacle = obstacles.create(window.innerWidth, window.innerHeight - 140, 'zombie');
        obstacle.setVelocityX(-200);
        // Set the size of the collision body to match the size of the zombie image
        obstacle.setSize(obstacle.width, obstacle.height);
    }

    function createStar() {
        const star = obstacles.create(window.innerWidth, window.innerHeight - 200, 'star');
        star.setVelocityX(-200);
    }

    function gameOver() {
        this.physics.pause();
        player.setTint(0xff0000);
        
        // Display game over text
        this.add.text(window.innerWidth / 2 - 100, window.innerHeight / 2 - 50, 'Game Over', { fontSize: '48px', fill: '#fff' });
        
        // Restart the game after 2 seconds
        this.time.delayedCall(2000, () => {
            this.scene.restart();
            obstacles.clear(true, true); // Clear obstacles
            score = 0; // Reset score
            updateScoreText(); // Update score text
            player.clearTint(); // Remove player tint
            starCounter = 0; // Reset star counter
        }, [], this);
    }

    function updateScoreText() {
        scoreText.setText('Zombies Survived: ' + score + ' Stars: ' + starCounter);
    }

    // Adjust game size on window resize
    window.addEventListener('resize', () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
    });
});
