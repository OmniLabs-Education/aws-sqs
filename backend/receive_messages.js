import 'dotenv/config'
import aws from 'aws-sdk'
import fs from 'fs'

aws.config.update({ region: 'us-east-1' })
const sqs = new aws.SQS()

const writeFile = (content) => {
  const stream = fs.createWriteStream(`./text.txt`, { flags: 'a' })

  stream.once('open', () => {
    stream.write('\n' + content + '\n')
  })

  stream.on('error', (err) => {
    console.log(err)
  })
}

const receive = async () => {
 sqs.receiveMessage(
    {
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/623994026831/queue',
      WaitTimeSeconds: 20,
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ['Attribute1', 'Attribute2']
    },
    (err, data) => {
      if(err) {
        console.log(err)
      } else if(data.Messages) {
        console.log("Mensagens recebidas", data.Messages.length)

        data.Messages.forEach(el => {
          writeFile(`${el.MessageId} - ${el.MessageAttributes.Attribute1.StringValue}`)

          sqs.deleteMessage(
            {
              QueueUrl: 'https://sqs.us-east-1.amazonaws.com/623994026831/queue',
              ReceiptHandle: el.ReceiptHandle
            },
            (err, data) => {
              if(err) {
                console.log(err)
              } else {
                console.log("Deletado com sucesso")
              }
            }
          )
        })
      }
    }
  )
}

setInterval(() => {
  receive()
}, 2000)
