
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

#define DHTPIN 5     // what digital pin we're connected to
#define DHTTYPE DHT11   // DHT 11
#define SENSORTOPIC "htn/sensors"
#define LEDTOPIC1 "htn/led1"
DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "Huynh Trinh"; //replace this with your wifi  name
const char* password = "16102017"; //replace with your wifi password
const char* mqtt_server = "192.168.1.104"; //replace this with IP address of machine

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[100];
//int value = 0;

char* converPayload(String payloadString);

void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  // Switch on the LED if an 1 was received as first character
  if ((char)payload[0] == '1') {
    digitalWrite(BUILTIN_LED, LOW);   // Turn the LED on (Note that LOW is the voltage level
    // but actually the LED is on; this is because
    // it is active low on the ESP-01)
  } else {
    digitalWrite(BUILTIN_LED, HIGH);  // Turn the LED off by making the voltage HIGH
  }

}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Once connected, publish an announcement...
//      client.publish(SENSORTOPIC, "hello world");
      // ... and resubscribe
      client.subscribe(LEDTOPIC1);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup() {
  pinMode(BUILTIN_LED, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  //setup dht
  dht.begin();
}

void loop() {

  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long now = millis();
  if (now - lastMsg > 2000) {
    lastMsg = now;
//    ++value;
    


  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  char* payload =  preparePayload(h, t);
  
  Serial.print("Publish message: ");
  Serial.println(payload);
  client.publish(SENSORTOPIC, payload);
  }
}


char* preparePayload(float h, float t) {
  String payload ="{";
  payload +="\"Temp\":";
  payload +=t; 
  payload +=",";
  payload +="\"Humi\":"; 
  payload +=h;
  payload +="}";
  char attributes[1000];
  payload.toCharArray(attributes, 1000);

  return attributes;
}
