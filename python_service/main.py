from fastapi import FastAPI, HTTPException
from zk import ZK, const
import sys

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "Python ZK Service Running"}

@app.get("/sync")
def sync_device(ip: str, port: int = 4370, timeout: int = 20, password: int = 0):
    print(f"Connecting to {ip}:{port} with pwd {password}...")
    zk = ZK(ip, port=port, timeout=timeout, password=password, force_udp=False, ommit_ping=False)
    conn = None
    try:
        conn = zk.connect()
        print("Connected! Disabling device...")
        conn.disable_device()
        
        print("Fetching users...")
        users = conn.get_users()
        
        print("Fetching attendance...")
        # Get attendances
        logs = conn.get_attendance()
        
        # Serialize data
        data_logs = []
        for log in logs:
            data_logs.append({
                "uid": log.uid,
                "user_id": log.user_id,
                "timestamp": log.timestamp.isoformat(),
                "status": log.status,
                "punch": log.punch
            })

        # Serialize users
        data_users = []
        for user in users:
            data_users.append({
                "uid": user.uid,
                "user_id": user.user_id,
                "name": user.name,
                "privilege": user.privilege,
                "password": user.password,
                "group_id": user.group_id,
                "card": user.card
            })

        print(f"Got {len(data_logs)} logs and {len(data_users)} users.")
        
        # Opcional: Limpiar logs después de leer (comentado por seguridad)
        # conn.clear_attendance()

        conn.enable_device()
        return {
            "success": True, 
            "logs": data_logs, 
            "users": data_users,
            "count": len(data_logs),
            "user_count": len(data_users)
        }

    except Exception as e:
        print(f"Error: {e}")
        return {"success": False, "error": str(e)}
    finally:
        if conn:
            print("Disconnecting...")
            conn.disconnect()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
