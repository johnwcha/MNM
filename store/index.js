export const state = () => ({
    user: false,
    avatar: '',
    code: '',
    email: '',
    items: [
      {
        icon: 'mdi-apps',
        title: 'Welcome',
        to: '/'
      },
      {
        icon: 'mdi-cog',
        title: 'Settings',
        to: '/user'
      },
    ],
    _animals: ['alligator.png', 'ant.png', 'bat.png', 'bear.png', 'bee.png', 'bird.png', 'bull.png', 'bulldog.png', 'butterfly.png', 'cat.png', 'chicken.png', 'cow.png', 'crab.png', 'crocodile.png', 'deer.png', 'dog.png', 'donkey.png', 'duck.png', 'eagle.png', 'elephant.png', 'fish.png', 'fox.png', 'frog.png', 'giraffe.png', 'gorilla.png', 'hippo.png', 'horse.png', 'insect.png', 'lion.png', 'monkey.png', 'moose.png', 'mouse.png', 'owl.png', 'penguin.png', 'pig.png', 'rabbit.png', 'rhino.png', 'rooster.png', 'shark.png', 'sheep.png', 'snake.png', 'tiger.png', 'turkey.png', 'turtle.png', 
                'wolf.png'
    ],
})