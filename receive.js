const amqp = require("amqplib");
const footnotes = require("./footnotes");
const putAsterisks = require('./putasterisks12')


const RABBIT_SETTINGS = {
    protocol: 'amqp',
    hostname: 'rabbit-mx-admin-dev.media.ru',
    port: 5672,
    username: 'developer',
    password: 'o3nFMLoaz899xNKPxk3xdLDUPoGt2Cup',
    // locale: 'en_US',
    // frameMax: 0,
    // heartbeat: 0,
    vhost: 'rabbit-MX-admin-dev',
}


connect();

async function connect() {
    try {

        // Подключаемся в качестве клиента к RabbitMQ
        const connection = await amqp.connect(RABBIT_SETTINGS)
        const channel = await connection.createChannel();
        actualQueue = await channel.assertQueue("123", {
            autoDelete: true
        });

        await channel.prefetch(1, [global])

        // Получаем сообщения из очереди
        await channel.consume("123", async message => {

            // если сообщение -> парсим из буфера в json
            let str = message.content.toString()
            let post = JSON.parse(str);
            console.log('post ДО модификации :>> ', post);
            for (const el of post.data.blocks) {
                console.log('el :>> ', el);
            }


            let bigSentense = ''
            bigSentense = post.lead + ' #&#'

            for (const el of post.data.blocks) {
                bigSentense += el.data.text + ' #&#'
            }
            let text = putAsterisks(footnotes, bigSentense)
            let category = text.catTypes
            console.log('category :>> ', category);

            bigSentense = text.finalSentence.split(/#&#/g)
            post.lead = bigSentense[0].trim()

            for (let i = 0; i < post.data.blocks.length; i++) {
                post.data.blocks[i].data.text = bigSentense[i + 1].trim()
            }

              for (let footnote = 0; footnote <= category.length; footnote++) {
 
                let terror = '*'.repeat(footnote + 1) + ` — запрещенная в РФ террористическая организация` 
                let extrimism = '*'.repeat(footnote + 1) + ` — запрещенная в РФ экстремистская организация`
                let inoagent = '*'.repeat(footnote + 1) + ` — физлицо или организация, признанные в РФ иноагентами`
                
                category[footnote] === 1 ? post.data.blocks.push({terror}) : null
                category[footnote] === 2 ? post.data.blocks.push({extrimism}) : null
                category[footnote] === 3 ? post.data.blocks.push({inoagent}) : null
     
            }
                footnotes.forEach(element => element.solve = false);

            

            console.log('post ПОСЛЕ модификации :>> ', post);

            for (const el of post.data.blocks) {
                console.log('el :>> ', el);
            }






        })

    } catch (ex) {
        console.error(ex)
    }
    console.log('i am working!')
    // setTimeout(function () {
    //     connect()
    // }, 5000)
}