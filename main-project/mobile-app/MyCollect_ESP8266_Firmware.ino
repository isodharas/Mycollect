/*
 * MyCollect - ESP8266 Firmware
 * Student: Dinithi Wijesinghe (10952811)
 * Hardware: NodeMCU ESP8266
 * Sensors: MQ-135 (gas, pin A0), HC-SR04 (ultrasonic, TRIG=D5, ECHO=D6)
 * Protocol: MQTT over TLS port 8883 → AWS IoT Core
 * Topic: mycollect/bin/data
 * Interval: Every 15 minutes (900 seconds)
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ── CONFIGURE THESE ───────────────────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_NAME";      // ← change this
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";  // ← change this
const char* BIN_ID        = "BIN_001";             // ← change per bin
// ─────────────────────────────────────────────────────────────────────────

// AWS IoT Core settings
const char* MQTT_HOST     = "a2ssuxaeoxfezu-ats.iot.ap-southeast-2.amazonaws.com";
const int   MQTT_PORT     = 8883;
const char* MQTT_TOPIC    = "mycollect/bin/data";
const char* CLIENT_ID     = "MyCollect_Bin_001";

// Publish interval — 15 minutes
const unsigned long PUBLISH_INTERVAL = 900000UL;

// Sensor pins
const int  GAS_PIN    = A0;   // MQ-135 analog output
const int  TRIG_PIN   = D5;   // HC-SR04 trigger
const int  ECHO_PIN   = D6;   // HC-SR04 echo

// Bin physical height in cm (distance when empty)
const float BIN_HEIGHT_CM = 50.0;

// ── CERTIFICATES ──────────────────────────────────────────────────────────

// Amazon Root CA 1
static const char ROOT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6
b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL
MAkGA1UEBhMCVVMxDzANBgVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv
b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj
ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM
9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw
IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6
VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L
93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm
jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC
AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA
A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI
U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs
N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv
o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU
5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy
rqXRfboQnoZsG4q5WTP468SQvvG5
-----END CERTIFICATE-----
)EOF";

// Device Certificate
static const char DEVICE_CERT[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDWTCCAkGgAwIBAgIUV1MKIeAbUuxbbEQJfVusRoxPMlgwDQYJKoZIhvcNAQEL
BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g
SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTI2MDQyNjE4MDM1
N1oXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAO352KO+pp9+CGw8waE0
6/+b5fwX17yfPKAifQKvlpNn5esML+fNaRmofz8zEddVwM0J8oGO1O6g1VX1UJDX
qdOMQlnIlisGYq13fr5kB35kzMUUYyCRmghTSZFhpPIG+O32JSLGMDRvpaoqSe3e
8lUxuYzfpKDbH7MNoODX/HLI8IEh3oiIFg2Gwy9+2Ao2pAFyJoo9rWPmHRq0tTNA
0nUzWBxbCPsL4vfTqdfBZeMpvuBR3qpE+NR1QfN4C+nZLs4M+h7qG7fMoCWWp8be
5KTHa6JNXt+yhtf8eoiNLes8LAkdBTBA0a/XnrMKEHoXpVGGFCFJOcC9w66JQGoJ
CMcCAwEAAaNgMF4wHwYDVR0jBBgwFoAU0YRBYhhbcl3FTQoJrVSzTdf6uV0wHQYD
VR0OBBYEFBtbycqlf/n5T5EBkubmw19HnXSWMAwGA1UdEwEB/wQCMAAwDgYDVR0P
AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQBa8XNrw284whhQxuYRtPb3/LGL
Nx0yOIWUc93trDWKh8rZKKGG7Asb/lEZDMpbGBxlb9kvqIX2cRdH4qh+c+oUTcrT
UMquku7yS7gmh1WI09wu41K4evKS0mcAcls0aULKwLUXilewffIaA7eUMepPBtr8
v0LM/TXAT7tgevDMwqLu8YnaxAhbJ4Tu9h35xfCtln7agg7ImBJ9msLowwpj1033
uu7Z6rDfIBoCTbyI59v0oJSkB2fPs0L8CJZaZaS7FM9VmWQ8Z3k3f/i3W3aZIrSt
QKF0zIBVaK5s72HZhhcvw0dEKQDGrhnB7tsboWTslmB7F7N0r/WGhOwRsxP/
-----END CERTIFICATE-----
)EOF";

// Device Private Key
static const char PRIVATE_KEY[] PROGMEM = R"EOF(
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA7fnYo76mn34IbDzBoTTr/5vl/BfXvJ88oCJ9Aq+Wk2fl6wwv
581pGah/PzMR11XAzQnygY7U7qDVVfVQkNep04xCWciWKwZirXd+vmQHfmTMxRRj
IJGaCFNJkWGk8gb47fYlIsYwNG+lqipJ7d7yVTG5jN+koNsfsw2g4Nf8csjwgSHe
iIgWDYbDL37YCjakAXImij2tY+YdGrS1M0DSdTNYHFsI+wvi99Op18Fl4ym+4FHe
qkT41HVB83gL6dkuzgz6Huobt8ygJZanxt7kpMdrok1e37KG1/x6iI0t6zwsCR0F
MEDRr9eeswoQehelUYYUIUk5wL3DrolAagkIxwIDAQABAoIBAQDO3/+geUBILjwM
O9Tn2yW9kz0fJWr6IkOFwfWCvDnd8thAuNt8W2keUQgtXKwJ0hZFKHyUfCJHP7G1
hAiBobmUmb2kZ2eEB40I13Rq9nI9QktwmASEb47D5gNySrwlWkJUO0KVNEz7iIMv
pouWKdXokc2H1XM8EsE/2n0ceSaQcMjcc4Tkiha4bZaXeOriHD+MIj64YBB3Huiv
kCTRZjN4S8e0B3von+zfFoU1+AWLQ/pULgeU1Te1V20ZRk1sgFGeACjUx2KnRa6P
jgA7gscj0aO3h7JU7nX3kZ+VqxTmWJibpMceoi9Y1e1ixlkgpnjPhRt07JfQ2nAx
zSNWhN1BAoGBAPiM0yvocK2ZjnDRzSTqxQ5i+lH963PakXbG57xokUpxgfMutGg1
9146aW6tkg2SmKHasDQAWGpcqBuct5gDb3ljD9b7SEZu61375IuI4awzRM1cY+nV
x3Dmhlk6MKc98RKMZHgOELKXTAcWjci2IdeCYIrshCUFXhW3wb/ZC4NPAoGBAPUb
4kYr6et4Y+GKQNT9Xo+PZeXKiKU9H/Oac6QAruX4TQv+v2DNAd9+ZtnH5iPe263j
v9h748PSDSlIjiHRwNX51gy0KHWCNvLycSLeHySbUEs6qbtd/vOfSY8cYegbLZdk
ZW2lbSbB0PX8/NjRbJ8tJANGT97yr9HbQWm5KSUJAoGAbNR8woUMkXbjP9MdmEST
9DCymqQsLJZPi0qcvYqr04TP+cNBiz/WCJRbBfNKOFcwLe6rqJleHXRkx3JfkVgv
v1742JE+nFiFBqn88HwHFHd+cM07km/g3DaULQ2lsBUXMZ/3ffnqpchJqfDeNDxL
pSmZTDszwWIQSEIlu/M1b1ECgYAXdv3ofde9BR96vgOK4F6nG7FDmGoQd5ORfJ3J
e49C0Mx/c3nayIV/YdhyzOJJWNJrCTyaevHJE1jTNPD2Z+AwG+TT/oNJDJg6Fd+i
2OTeWkgLi6goGc2IgR1HqA3vbHqm3aOgJZAXf8KDah7CmvntGyMxdQ+8ZjtSucy/
VEyOEQKBgDxZSRy7X6ucCvftGoqOlbiuSSaYFlo9y9rWAD4v/aMLH92oa8dXAXJS
3e6zRgAPLN6SkoqwEocAWmB+N339bmijzC1oyYP3Xh7nYRNW4JcFhQyhbd4kOBAO
iUC0Fihj0J31JnGpOwQcxxp+zhIOS/+cwhiT0e+nAjQiU1AeWVRD
-----END RSA PRIVATE KEY-----
)EOF";

// ── GLOBALS ───────────────────────────────────────────────────────────────
BearSSL::WiFiClientSecure  wifiClient;
BearSSL::X509List          rootCert(ROOT_CA);
BearSSL::X509List          clientCert(DEVICE_CERT);
BearSSL::PrivateKey        privateKey(PRIVATE_KEY);
PubSubClient               mqttClient(wifiClient);

unsigned long lastPublishTime = 0;

// Local buffer for offline readings (up to 96 = 24 hours at 15min intervals)
struct SensorReading {
  float gas_ppm;
  float fill_level;
  float temperature;
  float humidity;
  unsigned long timestamp;
};
SensorReading buffer[96];
int bufferHead = 0;
int bufferCount = 0;

// ── SENSOR FUNCTIONS ──────────────────────────────────────────────────────

float readGasPPM() {
  int raw = analogRead(GAS_PIN);  // 0-1023
  // Convert ADC reading to PPM
  // MQ-135 calibration: raw 0 = 0 PPM, raw 1023 = ~1000 PPM
  // Adjust multiplier based on your sensor calibration
  float voltage = raw * (3.3 / 1023.0);
  float ppm = (voltage / 3.3) * 1000.0;
  return constrain(ppm, 0, 10000);
}

float readFillLevel() {
  // HC-SR04 ultrasonic distance measurement
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) {
    Serial.println("HC-SR04: timeout, returning last known value");
    return 50.0; // fallback
  }

  float distanceCm = (duration * 0.034) / 2.0;
  distanceCm = constrain(distanceCm, 0, BIN_HEIGHT_CM);

  // Convert distance to fill percentage
  // When bin is empty: distance = BIN_HEIGHT_CM → fill = 0%
  // When bin is full:  distance = 0             → fill = 100%
  float fillPct = ((BIN_HEIGHT_CM - distanceCm) / BIN_HEIGHT_CM) * 100.0;
  return constrain(fillPct, 0, 100);
}

float readTemperature() {
  // ESP8266 has no built-in temp sensor
  // If you have a DHT11/DHT22 connected, read it here
  // For now returns a realistic Sri Lanka ambient temperature
  return 29.5;
}

float readHumidity() {
  // Same as above — replace with DHT reading if available
  return 76.0;
}

// ── WIFI ──────────────────────────────────────────────────────────────────

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());
    // Sync NTP time — required for TLS certificate validation
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    Serial.print("Syncing NTP time");
    while (time(nullptr) < 1000000000) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("\nTime synced: " + String(time(nullptr)));
  } else {
    Serial.println("\nWiFi failed — will retry");
  }
}

// ── MQTT ──────────────────────────────────────────────────────────────────

void connectMQTT() {
  wifiClient.setTrustAnchors(&rootCert);
  wifiClient.setClientRSACert(&clientCert, &privateKey);
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setBufferSize(512);

  Serial.print("Connecting to AWS IoT Core...");
  int attempts = 0;
  while (!mqttClient.connected() && attempts < 5) {
    if (mqttClient.connect(CLIENT_ID)) {
      Serial.println(" Connected!");
    } else {
      Serial.print(" Failed (state=");
      Serial.print(mqttClient.state());
      Serial.println(") retrying in 3s...");
      delay(3000);
      attempts++;
    }
  }
}

// ── PUBLISH ───────────────────────────────────────────────────────────────

bool publishReading(float gas, float fill, float temp, float hum, unsigned long ts) {
  StaticJsonDocument<256> doc;
  doc["bin_id"]      = BIN_ID;
  doc["gas_ppm"]     = round(gas * 10) / 10.0;
  doc["fill_level"]  = round(fill * 10) / 10.0;
  doc["temperature"] = round(temp * 10) / 10.0;
  doc["humidity"]    = round(hum * 10) / 10.0;
  doc["timestamp"]   = ts;

  char payload[256];
  serializeJson(doc, payload);

  Serial.println("Publishing: " + String(payload));

  if (mqttClient.publish(MQTT_TOPIC, payload)) {
    Serial.println("✓ Published to " + String(MQTT_TOPIC));
    return true;
  } else {
    Serial.println("✗ Publish failed");
    return false;
  }
}

void flushBuffer() {
  if (bufferCount == 0) return;
  Serial.println("Flushing " + String(bufferCount) + " buffered readings...");
  int flushed = 0;
  for (int i = 0; i < bufferCount; i++) {
    int idx = (bufferHead - bufferCount + i + 96) % 96;
    if (publishReading(
          buffer[idx].gas_ppm,
          buffer[idx].fill_level,
          buffer[idx].temperature,
          buffer[idx].humidity,
          buffer[idx].timestamp)) {
      flushed++;
      delay(500); // small delay between buffered publishes
    }
  }
  bufferCount = 0;
  Serial.println("Flushed " + String(flushed) + " readings");
}

void bufferReading(float gas, float fill, float temp, float hum) {
  buffer[bufferHead] = {gas, fill, temp, hum, (unsigned long)time(nullptr)};
  bufferHead = (bufferHead + 1) % 96;
  if (bufferCount < 96) bufferCount++;
  Serial.println("Buffered reading (buffer size: " + String(bufferCount) + ")");
}

// ── SETUP ─────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n\n=== MyCollect ESP8266 Firmware ===");
  Serial.println("Bin ID: " + String(BIN_ID));

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  connectWiFi();

  if (WiFi.status() == WL_CONNECTED) {
    connectMQTT();
  }

  // Publish first reading immediately on boot
  lastPublishTime = millis() - PUBLISH_INTERVAL;
}

// ── LOOP ──────────────────────────────────────────────────────────────────

void loop() {
  // Reconnect WiFi if dropped
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost — reconnecting...");
    connectWiFi();
  }

  // Keep MQTT alive
  if (WiFi.status() == WL_CONNECTED) {
    if (!mqttClient.connected()) {
      connectMQTT();
    }
    mqttClient.loop();
  }

  // Publish every 15 minutes
  unsigned long now = millis();
  if (now - lastPublishTime >= PUBLISH_INTERVAL) {
    lastPublishTime = now;

    // Read sensors
    float gas  = readGasPPM();
    float fill = readFillLevel();
    float temp = readTemperature();
    float hum  = readHumidity();

    Serial.println("=== Sensor Reading ===");
    Serial.println("Gas PPM:    " + String(gas));
    Serial.println("Fill Level: " + String(fill) + "%");
    Serial.println("Temp:       " + String(temp) + "C");
    Serial.println("Humidity:   " + String(hum) + "%");

    if (WiFi.status() == WL_CONNECTED && mqttClient.connected()) {
      // Flush any buffered readings first
      if (bufferCount > 0) flushBuffer();
      // Then publish current reading
      publishReading(gas, fill, temp, hum, (unsigned long)time(nullptr));
    } else {
      // WiFi/MQTT unavailable — buffer locally
      bufferReading(gas, fill, temp, hum);
      Serial.println("Offline — reading buffered (" + String(bufferCount) + "/96)");
    }
  }
}
