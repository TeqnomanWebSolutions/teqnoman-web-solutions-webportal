import axios from "axios";
import bcrypt from 'bcryptjs';

async function securedMiddleware() {
  const saltRounds = 10;
  const password = 'teqnoman-web-solutions-web-portal';
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const headers = { Authorization: `Bearer ${hashedPassword}` };
  return axios.create({ headers });
}

export default securedMiddleware;

export const instance = await securedMiddleware()

export function getGreetingByTime(currentTime) {
  const hours = currentTime.getHours();

  if (hours >= 5 && hours < 12) {
    return "Good Morning";
  } else if (hours >= 12 && hours < 17) {
    return "Good Afternoon";
  } else if (hours >= 17 && hours < 21) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
}

export const elapsedTime = (timestamp) => {
  const currentTime = new Date();
  const elapsedMilliseconds = currentTime - timestamp;
  const minutesAgo = Math.floor(elapsedMilliseconds / 60000);
  if (minutesAgo < 60) {
    return `${minutesAgo} minutes ago`;
  } else if (minutesAgo < 1440) { // 24 hours in minutes
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo} hours ago`;
  } else if (minutesAgo < 43200) { // 30 days in minutes
    const daysAgo = Math.floor(minutesAgo / 1440);
    return `${daysAgo} days ago`;
  } else if (minutesAgo < 518400) { // 360 days in minutes
    const monthsAgo = Math.floor(minutesAgo / 43200);
    return monthsAgo === 1 ? "1 month ago" : `${monthsAgo} months ago`;
  } else {
    const yearsAgo = Math.floor(minutesAgo / 518400);
    return yearsAgo === 1 ? "1 year ago" : `${yearsAgo} years ago`;
  }
};

export const secureAccess = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // for security purpose
  if (token === undefined) {
    return res.status(401).json({ message: "Access Denied!" });
  }

  const hash = "teqnoman-web-solutions-web-portal";
  const getAccess = await bcrypt.compare(hash, token);

  // for security purpose end
  if (!getAccess) {
    return res.status(401).json({ message: "Access Denied!" });
  }

  return true;
};