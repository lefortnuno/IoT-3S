// Realistic Simulation with : Variations Circadiennes and Anomalies 
#include <math.h>

float lastTemperature = 36.8;   
float lastHeartRate = 72.6;         
float lastSpO2 = 98.3;              

unsigned long lastUpdate = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  unsigned long currentMillis = millis();
 
  if (currentMillis - lastUpdate >= 2000) {
    lastUpdate = currentMillis;
 
    float hour = (currentMillis / (3600000.0 / 2)) - 6; // Simule l'heure sur 24h
    float circadianTemp = 36.5 + 0.3 * sin((hour / 24.0) * 2 * PI);  // Pic autour de 18h
    float randomTempVariation = random(-10, 11) / 20.0;  // Variation aléatoire -0.5°C à +0.5°C
    lastTemperature = circadianTemp + randomTempVariation; 
  
    float circadianHeartRate = 72.0 + 3.0 * sin((hour / 24.0) * 2 * PI);   
    float randomHeartRateVariation = random(-100, 101) / 100.0;          // Variation (-1 à +1 bpm)
    float activityFactor = (random(1, 101) <= 10) ? random(200, 401) / 10.0 : 0; // 10% de chance d'effort physique
    lastHeartRate = circadianHeartRate + randomHeartRateVariation + activityFactor;
 
    float circadianSpO2 = 98.0 + 0.2 * sin((hour / 24.0) * 2 * PI);    
    float randomSpO2Variation = random(-10, 11) / 100.0;                // Variation (-0.1% à +0.1%)
    if (random(1, 101) <= 5) {  // 5% chute anomalie
      lastSpO2 = random(850, 950) / 10.0;  // Chute temporaire (85% à 95%)
    } else {
      lastSpO2 = circadianSpO2 + randomSpO2Variation;
    }

    // Introduire une anomalie toutes les heures (simulation)
    if (random(1, 11) == 1) {  // 1/360 chance (1 par heure en moyenne)
      lastTemperature = random(394, 424) / 10.0;  // Hyperthermie
      lastHeartRate = random(1111, 1333) / 10.0;           // Tachycardie
      lastSpO2 = random(811, 891) / 10.0;                 // Hypoxémie
    }
 
    Serial.print(lastTemperature, 1);   
    Serial.print(",");
    Serial.print(lastHeartRate, 1);        
    Serial.print(",");
    Serial.println(lastSpO2, 1);           
 
    delay(2000);
  }
}
