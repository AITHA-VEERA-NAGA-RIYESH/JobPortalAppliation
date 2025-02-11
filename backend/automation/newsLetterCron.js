import cron from 'node-cron';
import { User } from '../models/user.model.js';
import { Job } from '../models/job.model.js';
import { sendEmail } from '../utils/sendEmail.js';

export const newsLetterCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log(`[${new Date().toISOString()}] Running Cron Automation`);

    try {
      const jobs = await Job.find({ newsLettersSent: false }).populate('company', 'name');
      for (const job of jobs) {
        let filteredUsers = await User.find({
          "profile.skills": { $regex: job.title, $options: "i" },
        })
        if (filteredUsers.length === 0) {
          const keywords = job.title.split(" ");
          filteredUsers = await User.find({
            "profile.skills": { $in: keywords },
          });
          console.log(`Keyword matches found: ${filteredUsers.length}`);
        } else {
          console.log(`Exact matches found: ${filteredUsers.length}`);
        }
        let emailsSentSuccessfully = true;
        for (const user of filteredUsers) {
          const subject = `Hot Job Alert: ${job.title} Matching Your Skills`;
          const message = `
Hi ${user.fullname},

Great news! A new job that matches your skills has been posted.

**Job Details:**
- **Position:** ${job.title}
- **Company:** ${job.company.name}
- **Location:** ${job.location}
- **Salary:** ${job.salary}

This is a perfect opportunity for someone with skills like yours:
${job.title}.

Don't miss out! Apply now to secure your position.

Best Regards,
Your Job Portal Team
          `;
          try {
            await sendEmail({
              email: user.email,
              subject,
              message,
            });
          } catch (err) {
            emailsSentSuccessfully = false;
          }
        }
        if (emailsSentSuccessfully) {
          job.newsLettersSent = true;
          await job.save();
        }
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ERROR IN CRON AUTOMATION:`, error);
    }
  });
};

