// SIMULATION AVANCER 

float lastTemperature = 36.5;   
int lastHeartRate = 75;         
int lastSpO2 = 98;              

void setup() {
  Serial.begin(9600);  
}

void loop() { 
  float temperatureVariation = random(-5, 6) / 10.0;  // Variation entre -0.5°C et +0.5°C
  lastTemperature += temperatureVariation;
  if (lastTemperature < 36.0) lastTemperature = 36.0; 
  if (lastTemperature > 37.5) lastTemperature = 37.5;
 
  int heartRateVariation = random(-3, 4);  // Variation entre -3 et +3 bpm
  lastHeartRate += heartRateVariation; 
  if (lastHeartRate < 60) lastHeartRate = 60;
  if (lastHeartRate > 100) lastHeartRate = 100;
 
  int spo2Variation = random(-1, 2);  // Variation entre -1 et +1%
  lastSpO2 += spo2Variation; 
  if (lastSpO2 < 95) lastSpO2 = 95;
  if (lastSpO2 > 100) lastSpO2 = 100;
 
  Serial.print(lastTemperature, 2); //2chiffres apres virgule   
  Serial.print(",");
  Serial.print(lastHeartRate);  
  Serial.print(",");
  Serial.println(lastSpO2);  

  delay(2000);  //2secondes (échelle de 2 heures)
}
