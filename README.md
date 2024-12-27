# Market-Data-Analytics (Business Intelligence Dashboard)

## Description
This project provides a Business Intelligence (BI) dashboard that allows users to view, edit, delete, and manage information from the database. It also analyzes market conditions and suggests business scenarios for customers.

## Features
- **View Information**: Display detailed information about products, sales, and market conditions.
- **Edit Information**: Update product information and related data.
- **Delete Information**: Remove unnecessary or outdated information.
- **Manage Information**: Create, edit, and delete information in the database.
- **Market Analysis**: Use analytical models to evaluate market conditions.
- **Business Recommendations**: Provide strategic business suggestions based on data analysis.

## System Requirements
- Python 3.x
- Flask
- SQLAlchemy
- Pandas
- scikit-learn
- scipy
- numpy
- MySQL database

## Installation
1. **Clone the repository**:
    ```bash
    git clone https://github.com/tidzvl/Market-Data-Analytics
    cd your-repo
    ```

2. **Create and activate a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install the required libraries**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Set environment variables**:
    Create a `.env` file in the root directory of the project and add the following environment variables:
    ```env
    SQLALCHEMY_DATABASE_URI=mysql+pymysql://username:password@host:port/database
    SECRET_KEY=your_secret_key
    ```

## Usage
1. **Run the application**:
    ```bash
    flask run
    ```

2. **Access the dashboard**: Open your browser and go to `http://127.0.0.1:5000` if you dont have any hosting or server open port and change the port in `/public/python-api/run.py`.

3. **Add the dashboard (OPN)**: If you want to make this Dashboard for your website, you can try `nginx` and config follow:
```
    server {
        listen 80;
        server_name dashboard.yourdomainname;

        location / {
            proxy_pass http://localhost:5000; 
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
```

## API Endpoints
- **Please check it in** `/public/python-api/app/routes.py`

## Contributing
If you want to contribute to this project, please fork the repository, create a new branch, make your changes, and submit a pull request. We welcome all contributions!

## Contact
If you have any questions, please contact us at nguyentinvs123@gmail.com.

## License
This project is licensed under the MIT License. See the `LICENSE` file if it contains for details.
