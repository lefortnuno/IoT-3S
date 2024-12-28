// SIMULATION INITIAL 

void setup() {
    Serial.begin(9600);  
}

void loop() {
    float temperature = random(350, 420) / 10.0;
    int heartRate = random(50, 121);
  	int spo2 = random(80, 101); 
    
    Serial.print(temperature);
    Serial.print(",");
    Serial.print(heartRate);
    Serial.print(",");
    Serial.println(spo2);
  
    delay(2000);  
}