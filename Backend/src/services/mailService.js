import { connect as tlsConnect } from 'node:tls';

function createSmtpReader(socket) {
  let buffer = '';
  let lines = [];
  const replies = [];
  const readers = [];

  const publish = () => {
    while (replies.length && readers.length) readers.shift()(replies.shift());
  };

  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    let newline = buffer.indexOf('\n');
    while (newline >= 0) {
      const line = buffer.slice(0, newline).replace(/\r$/, '');
      buffer = buffer.slice(newline + 1);
      lines.push(line);
      if (/^\d{3} /.test(line)) {
        replies.push(lines.join('\r\n'));
        lines = [];
        publish();
      }
      newline = buffer.indexOf('\n');
    }
  });

  socket.on('error', (error) => {
    while (readers.length) readers.shift()(Promise.reject(error));
  });

  return () => new Promise((resolve, reject) => {
    readers.push((result) => {
      if (result instanceof Promise) result.catch(reject);
      else resolve(result);
    });
    publish();
  });
}

export async function sendContactNotification({ name, email, subject, message, createdAt }) {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 465);
  const user = process.env.MAIL_USER;
  const password = process.env.MAIL_PASSWORD;
  const from = process.env.MAIL_FROM || user;
  const to = process.env.CONTACT_RECEIVER_EMAIL;

  if (!host || !user || !password || !from || !to) return false;
  if (port !== 465) throw new Error('SMTP must use implicit TLS on port 465.');

  const socket = tlsConnect({ host, port, servername: host });
  socket.setTimeout(15000, () => socket.destroy(new Error('SMTP timed out.')));
  const readResponse = createSmtpReader(socket);
  const command = async (value, expectedCode) => {
    const responsePromise = readResponse();
    socket.write(`${value}\r\n`);
    const response = await responsePromise;
    if (!response.startsWith(String(expectedCode))) throw new Error(`SMTP returned ${response.slice(0, 3)}.`);
  };

  try {
    await new Promise((resolve, reject) => {
      socket.once('secureConnect', resolve);
      socket.once('error', reject);
    });
    const greeting = await readResponse();
    if (!greeting.startsWith('220')) throw new Error('SMTP server did not greet the connection.');
    await command('EHLO portfolio.local', 250);
    await command('AUTH LOGIN', 334);
    await command(Buffer.from(user).toString('base64'), 334);
    await command(Buffer.from(password).toString('base64'), 235);
    await command(`MAIL FROM:<${from}>`, 250);
    await command(`RCPT TO:<${to}>`, 250);
    await command('DATA', 354);

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      `Submitted: ${createdAt}`,
      '',
      message,
    ].join('\r\n');
    const encodedBody = Buffer.from(body)
      .toString('base64')
      .match(/.{1,76}/g)
      .join('\r\n');
    const encodedSubject = Buffer.from(subject).toString('base64');
    const responsePromise = readResponse();
    socket.write(
      `From: ${from}\r\nTo: ${to}\r\nReply-To: ${email}\r\nSubject: =?UTF-8?B?${encodedSubject}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${encodedBody}\r\n.\r\n`,
    );
    const sent = await responsePromise;
    if (!sent.startsWith('250')) throw new Error('SMTP rejected the message.');
    await command('QUIT', 221);
    return true;
  } finally {
    socket.destroy();
  }
}
