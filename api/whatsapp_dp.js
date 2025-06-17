const { create } = require('venom-bot');

module.exports = async (req, res) => {
  const { number } = req.query;

  if (!number || !number.startsWith('+')) {
    return res.status(400).json({ error: 'Please provide number in international format, e.g., +14155552671' });
  }

  create({
    session: process.env.SESSION_NAME || 'zerocreations',
    disableWelcome: true,
    updatesLog: false,
    headless: true
  }).then((client) => fetchDP(client, number, res)).catch(() => {
    return res.status(500).json({ error: 'Failed to initialize WhatsApp client' });
  });
};

async function fetchDP(client, number, res) {
  try {
    const profile = await client.getProfilePicFromServer(number);
    await client.close();

    if (profile && profile.imgFull) {
      return res.status(200).json({
        success: true,
        number,
        dp_url: profile.imgFull,
        thumbnail: profile.imgPreview
      });
    } else {
      return res.status(404).json({ error: 'Profile picture not found or number not on WhatsApp' });
    }
  } catch (e) {
    await client.close();
    return res.status(500).json({ error: 'Error fetching profile picture', details: e.message });
  }
}
