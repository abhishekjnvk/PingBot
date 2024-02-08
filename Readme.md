# Ping Bot
Ping Bot is a web application designed for network and server monitoring. It sends regular "ping" requests to various servers or devices to check their availability and response times, helping users monitor the uptime and performance of their online services.

## Features

- **Ping Monitoring**: Ping Bot sends regular ping requests to specified servers or devices to check their availability.
- **Response Time Tracking**: It measures the response time of the ping requests to assess the performance of the monitored resources.
- **Alerting**: Ping Bot provides alert notifications via email or other channels if any monitored resources become unavailable or experience performance issues.
- **Customization**: Users can customize monitoring settings, including ping frequency, target servers/devices, and alert thresholds.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/abhishekjnvk/PingBot

2. Install dependencies:
   ```bash
    npm install

3. copy env file
   ```bash
   cp .env.example .env
4. configure environment variables  in `.env`
5. start application using `npm run dev`


## Usage
Once the application is running, you can:
* Add new servers/devices to monitor.
* View real-time status updates and response times.
* Configure alerting preferences.
* Monitor historical data and performance trends

## Contributing

Contributions are welcome! If you have any ideas for new features, improvements, or bug fixes, please submit a pull request.

