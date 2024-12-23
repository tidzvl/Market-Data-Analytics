import pymysql

try:
    conn = pymysql.connect(
        host='electronics.mysql.database.azure.com',
        user='HcmutElectronics',
        password='Kua@1234',
        db='new_schema',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        ssl={'fake_flag_to_enable_tls': True}
    )
    print("Kết nối thành công")
except pymysql.err.OperationalError as e:
    print("Không thể kết nối:", e)
