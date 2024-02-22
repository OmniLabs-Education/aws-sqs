import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import aws from 'aws-sdk'
import { randomUUID } from 'node:crypto'

const app = express()
const folder = path.resolve(process.env.PWD, '..', 'frontend')

app.use(express.static(folder))
app.use(express.json())

aws.config.update({ region: 'us-east-1' })
const sqs = new aws.SQS()

app.post('/queue', (req, res) => {
  const qty = parseInt(req.body.qty)

  for (let index = 0; index < qty; index++) {
    sqs.sendMessage(
      {
        MessageBody: 'Mensagem de teste',
        QueueUrl: 'https://sqs.us-east-1.amazonaws.com/623994026831/queue',
        MessageAttributes: {
          'Attribute1': {
            DataType: 'String',
            StringValue: `Valor do atributo 1 - ${randomUUID()}`
          },
          'Attribute2': {
            DataType: 'String',
            StringValue: `Valor do atributo 2 - ${randomUUID()}`
          }
        }
      },
      (err, data) => {
        if(err) {
          console.log(err)
        } else {
          console.log(`Success - ${index + 1}`, data.MessageId)
        }
      }
    )
  }

  res.json({
    ok: true
  })
})

app.listen(3000, () => {
  console.log('Server started')
})