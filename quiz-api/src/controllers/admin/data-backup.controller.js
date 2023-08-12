const mongoose = require('mongoose');
const archiver = require('archiver');
const { handleControllerError } = require("../../../utils/helpers");
const sendMail = require('../../../config/mail');

// Module Exports
module.exports = {
  backupDatabase,
};

async function backupDatabase(req, res, next) {
  try {
    
    const archive = archiver('zip');

    // Set the output file name
    const outputFilename = 'backup.zip';
    res.attachment(outputFilename);

    // Get a list of all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Fetch and add data from each collection to the archive
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await mongoose.connection.db.collection(collectionName).find().toArray();
      if (data) {
        console.log(`Data retrieved from ${collectionName}:`, data);
        archive.append(JSON.stringify(data), { name: `${collectionName}.json` });
      } else {
        console.error(`Failed to retrieve data from ${collectionName}`);
      }
    }

    // Finalize the archive and send it to the client
    archive.finalize(); // Finalize the archive
    archive.pipe(res); // Send the archive data to the client
  } catch (e) {
    res.status(500).send(e.message);
    throw handleControllerError(e);
  }
}

async function reminderMail () {
  try {
    let mailOptions = {};

    mailOptions.to = 'iasritikchourasiya@gmail.com';
    mailOptions.subject = 'Reminder to backup database';
    mailOptions.html = `
      <p>Hi Admin,</p>
      <p>This is a reminder to backup the database.</p>
      <p>Regards,</p>
      <p>PollSage</p>
    `;

    await sendMail(mailOptions);
  } catch (e) {
    throw e;
  }
}

function reminder() {
  // set up a cron job to run every week to send reminder emails to admin to backup database
  const cronJobManager = require('../../cronjob/cron_job_manager.js');
  cronJobManager.addJob('backupDatabase', '0 0 * * 0', reminderMail);
}

reminder();


// backupDatabase();
