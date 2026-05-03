# MyCollect Backend

AI-Powered Waste Management System - AWS Backend

## Structure
- `lambda_functions/` - AWS Lambda function code
- `ml_model/` - Random Forest ML model and training script

## ML Model
- Algorithm: Random Forest Classifier
- Accuracy: 95.94%
- Priority Classes: LOW, MEDIUM, HIGH, CRITICAL
- Features: fill_level, gas_ppm, temperature, humidity, weighted_score

## AWS Infrastructure
- Lambda: ProcessBinData
- DynamoDB: BinSensorData, BinLatestStatus
- API Gateway: ap-southeast-2
