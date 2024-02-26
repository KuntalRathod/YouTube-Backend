import nodemailer from "nodemailer"

const sendEmail = async function (email, subject, message) {
  // Create a transporter using SMTP or some other transport mechanism
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE_NAME,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,

    auth: {
      user: "process.env.SMTP.USERNAME",
      pass: "process.env.SMTP.PASSWORD",
    },
  })

  // Define the email options
  const mailOptions = {
    from: {
      name: "VideoTube",
      address: process.env.SMTP_FROM_EMAIL,
    },
    to: email, ///user email
    subject: subject,
    html: message,
    //text: "Body of the email",
  }

  // Send the email
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error)
    } else {
      console.log("Email sent:", info.response)
    }
  })
}

export default sendEmail
