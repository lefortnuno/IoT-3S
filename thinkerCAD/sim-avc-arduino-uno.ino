// Realistic Simulation with : Variations Circadiennes and Anomalies 
#include <math.h>

float lastTemperature = 36.8;   
int lastHeartRate = 72;         
int lastSpO2 = 98;              

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
 
    int baselineHeartRate = 72 + random(-5, 6);  // Variation entre 67 et 77 bpm
    float activityFactor = random(1, 101) <= 10 ? random(20, 41) : 0;  // 10% de chance d'effort physique
    lastHeartRate = baselineHeartRate + activityFactor; 
 
    int baselineSpO2 = 98 + random(-2, 1);  // Variation normale
    if (random(1, 101) <= 5) {  // 5% de chance de chute due à une anomalie
      lastSpO2 = random(85, 95);  // Chute temporaire
    } else {
      lastSpO2 = baselineSpO2;
    }

    // Introduire une anomalie toutes les heures (simulation)
    if (random(1, 11) == 1) {  // 1/360 chance (1 par heure en moyenne)
      lastTemperature = random(390, 420) / 10.0;  // Hyperthermie
      lastHeartRate = random(130, 180);           // Tachycardie
      lastSpO2 = random(80, 94);                 // Hypoxémie
    }
 
    Serial.print(lastTemperature, 2);   
    Serial.print(",");
    Serial.print(lastHeartRate);        
    Serial.print(",");
    Serial.println(lastSpO2);           
 
    delay(2000);
  }
}
