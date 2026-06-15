import os
import json
from pathlib import Path
from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient
from typing import Dict, Any

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).parent / '.env', override=True)

class BlobStorageService:
    def __init__(self):
        self.connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "finance-ai-data")
        
        self.blob_service_client = None
        self.container_client = None
        
        if self.connection_string:
            try:
                self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
                self.container_client = self.blob_service_client.get_container_client(self.container_name)
                
                # Create the container if it doesn't exist
                if not self.container_client.exists():
                    self.container_client.create_container()
                    print(f"✅ Created Azure Blob Container: {self.container_name}")
                else:
                    print(f"✅ Connected to Azure Blob Container: {self.container_name}")
            except Exception as e:
                print(f"❌ Error connecting to Azure Blob Storage: {e}")
                self.blob_service_client = None
        else:
            print("⚠️ AZURE_STORAGE_CONNECTION_STRING not found. Blob storage features disabled.")

    def upload_file(self, file_path: str, blob_name: str) -> bool:
        """Uploads a local file to Azure Blob Storage."""
        if not self.blob_service_client:
            return False
            
        try:
            blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=blob_name)
            with open(file_path, "rb") as data:
                blob_client.upload_blob(data, overwrite=True)
            print(f"✅ Successfully uploaded {file_path} to {blob_name}")
            return True
        except Exception as e:
            print(f"❌ Failed to upload file '{file_path}': {e}")
            return False

    def upload_json(self, data: Dict[str, Any], blob_name: str) -> bool:
        """Uploads a dictionary as a JSON file to Azure Blob Storage."""
        if not self.blob_service_client:
            return False
            
        try:
            blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=blob_name)
            json_data = json.dumps(data, indent=4)
            blob_client.upload_blob(json_data, overwrite=True)
            print(f"✅ Successfully uploaded JSON data to {blob_name}")
            return True
        except Exception as e:
            print(f"❌ Failed to upload JSON data: {e}")
            return False

    def download_file(self, blob_name: str, download_file_path: str) -> bool:
        """Downloads a file from Azure Blob Storage to a local path."""
        if not self.blob_service_client:
            return False
            
        try:
            blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=blob_name)
            with open(download_file_path, "wb") as download_file:
                download_file.write(blob_client.download_blob().readall())
            print(f"✅ successfully downloaded {blob_name} to {download_file_path}")
            return True
        except Exception as e:
            print(f"❌ Failed to download file '{blob_name}': {e}")
            return False

# Export a single instance
blob_service = BlobStorageService()
