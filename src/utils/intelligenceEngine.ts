import { CurrentWeather, DailyForecastItem, OutfitItem, ActivityRecommendation, WeatherAlert } from '../types/weather';
import { getWmoInfo } from './wmoCodes';

export function convertTemp(celsius: number, unit: 'celsius' | 'fahrenheit'): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatTemp(celsius: number, unit: 'celsius' | 'fahrenheit'): string {
  const val = convertTemp(celsius, unit);
  return `${val}°${unit === 'celsius' ? 'C' : 'F'}`;
}

export function convertSpeed(kmh: number, unit: 'kmh' | 'mph' | 'ms'): number {
  if (unit === 'mph') return Math.round(kmh * 0.621371);
  if (unit === 'ms') return Math.round((kmh / 3.6) * 10) / 10;
  return Math.round(kmh);
}

export function formatSpeed(kmh: number, unit: 'kmh' | 'mph' | 'ms'): string {
  const val = convertSpeed(kmh, unit);
  const label = unit === 'kmh' ? 'km/h' : unit === 'mph' ? 'mph' : 'm/s';
  return `${val} ${label}`;
}

export interface IntelligenceResult {
  outfits: OutfitItem[];
  outfitSummary: string;
  activities: ActivityRecommendation[];
  alerts: WeatherAlert[];
  comfortScore: number; // 0-100
  comfortLabel: string;
}

export function analyzeWeatherIntelligence(
  current: CurrentWeather,
  dailyToday?: DailyForecastItem
): IntelligenceResult {
  const tempC = current.apparent_temperature; // feels like temperature
  const realTempC = current.temperature;
  const windKmh = current.wind_speed_10m;
  const uvIndex = current.uv_index;
  const wmo = getWmoInfo(current.weather_code);
  const rainProb = dailyToday?.precipitation_probability_max ?? (current.precipitation > 0 ? 90 : 20);

  const outfits: OutfitItem[] = [];
  let outfitSummary = '';

  // Temperature logic for clothing
  if (tempC <= -5) {
    outfitSummary = 'Extreme Cold Layering: Heavy insulated parka, thermal base layers & snow gear needed.';
    outfits.push(
      { category: 'top', label: 'Thermal Base Layer + Heavy Wool Sweater', iconName: 'Shirt' },
      { category: 'bottom', label: 'Thermal Leggings + Fleece-Lined Trousers', iconName: 'Scissors' },
      { category: 'outerwear', label: 'Heavy Down Parka / Insulated Winter Coat', iconName: 'Wind' },
      { category: 'footwear', label: 'Waterproof Winter Boots + Thick Wool Socks', iconName: 'Footprints' },
      { category: 'accessory', label: 'Beanie, Insulated Gloves & Heavy Scarf', iconName: 'Glasses' }
    );
  } else if (tempC <= 5) {
    outfitSummary = 'Cold Weather Layering: Warm coat, sweater & wind-resistant outerwear recommended.';
    outfits.push(
      { category: 'top', label: 'Long Sleeve Top + Knit Fleece Sweater', iconName: 'Shirt' },
      { category: 'bottom', label: 'Heavy Jeans or Corduroy Pants', iconName: 'Scissors' },
      { category: 'outerwear', label: 'Puffer Jacket or Wool Trench Coat', iconName: 'Wind' },
      { category: 'footwear', label: 'Warm Leather Boots or Cushioned Sneakers', iconName: 'Footprints' },
      { category: 'accessory', label: 'Knit Beanie & Light Gloves', iconName: 'Glasses' }
    );
  } else if (tempC <= 14) {
    outfitSummary = 'Brisk Crisp Day: Light jacket or cardigan over shirt with comfortable trousers.';
    outfits.push(
      { category: 'top', label: 'Cotton Long-Sleeve Shirt or Lightweight Hoodie', iconName: 'Shirt' },
      { category: 'bottom', label: 'Chinos or Denim Jeans', iconName: 'Scissors' },
      { category: 'outerwear', label: 'Denim Jacket, Windbreaker, or Cardigan', iconName: 'Wind' },
      { category: 'footwear', label: 'Casual Sneakers or Ankle Boots', iconName: 'Footprints' },
      { category: 'accessory', label: 'Light Scarf (optional)', iconName: 'Glasses' }
    );
  } else if (tempC <= 21) {
    outfitSummary = 'Mild & Pleasant: Breathable cotton layers or long-sleeve tee. Ideal outfit conditions.';
    outfits.push(
      { category: 'top', label: 'Breathable Cotton T-Shirt or Linen Long Sleeve', iconName: 'Shirt' },
      { category: 'bottom', label: 'Light Jeans, Chinos, or Midi Skirt', iconName: 'Scissors' },
      { category: 'outerwear', label: 'Light Overshirt or Wind Jacket for evening', iconName: 'Wind' },
      { category: 'footwear', label: 'Walking Sneakers or Loafers', iconName: 'Footprints' },
      { category: 'accessory', label: 'Sunglasses', iconName: 'Glasses' }
    );
  } else if (tempC <= 28) {
    outfitSummary = 'Warm & Sunny: Light linen or cotton tops, shorts, or summer dresses with UV protection.';
    outfits.push(
      { category: 'top', label: 'Short-Sleeve Cotton Tee, Tank or Linen Shirt', iconName: 'Shirt' },
      { category: 'bottom', label: 'Breathable Shorts, Linen Pants or Sundress', iconName: 'Scissors' },
      { category: 'outerwear', label: 'None needed during day', iconName: 'Wind' },
      { category: 'footwear', label: 'Canvas Sneakers, Sandals, or Open Shoes', iconName: 'Footprints' },
      { category: 'accessory', label: 'Sunglasses & Sun Hat', iconName: 'Glasses' }
    );
  } else {
    outfitSummary = 'Hot Weather: Ultra-light loose linen garments, maximum breathability & hydration.';
    outfits.push(
      { category: 'top', label: 'Loose Loose Linen Shirt or Breathable Tank', iconName: 'Shirt' },
      { category: 'bottom', label: 'Light Shorts or Breathable Flowy Skirt', iconName: 'Scissors' },
      { category: 'outerwear', label: 'None (Stay shaded)', iconName: 'Wind' },
      { category: 'footwear', label: 'Breathable Sandals or Light Mesh Shoes', iconName: 'Footprints' },
      { category: 'accessory', label: 'UV Sunglasses, Wide-Brim Hat & Sunscreen', iconName: 'Glasses' }
    );
  }

  // Rain modifications
  if (wmo.group === 'rain' || wmo.group === 'drizzle' || wmo.group === 'thunderstorm' || rainProb > 50) {
    outfits.push({
      category: 'accessory',
      label: 'Compact Windproof Umbrella + Waterproof Rain Shell',
      iconName: 'Umbrella',
      note: 'Rain expected',
    });
  }

  // UV modifications
  if (uvIndex >= 6) {
    outfits.push({
      category: 'accessory',
      label: 'SPF 50 Broad Spectrum Sunscreen & Polarized UV Glasses',
      iconName: 'Sun',
      note: 'High UV Radiation',
    });
  }

  // Activity Planner calculations
  const activities: ActivityRecommendation[] = [];

  // 1. Running & Jogging
  let runScore = 100;
  let runStatus: 'ideal' | 'caution' | 'avoid' = 'ideal';
  let runReason = 'Great temperature and low wind for running.';
  let runTip = 'Stay hydrated and maintain a comfortable pace.';

  if (tempC < 2) {
    runScore -= 30;
    runReason = 'Freezing temperature; muscle stiffness and ice hazard.';
    runTip = 'Wear thermal layers, gloves, and warm up thoroughly inside.';
  } else if (tempC > 28) {
    runScore -= 40;
    runReason = 'High heat stress and risk of dehydration.';
    runTip = 'Run early morning or evening; carry electrolyte drinks.';
  }

  if (wmo.group === 'rain' || wmo.group === 'thunderstorm') {
    runScore -= 50;
    runReason = 'Slippery roads and precipitation.';
    runTip = 'Wear waterproof running jacket with high-visibility reflective gear.';
  }
  if (windKmh > 30) {
    runScore -= 20;
    runReason = 'Strong headwind reduces running comfort.';
  }
  if (runScore < 45) runStatus = 'avoid';
  else if (runScore < 75) runStatus = 'caution';

  activities.push({
    id: 'running',
    title: 'Outdoor Running & Jogging',
    category: 'sport',
    icon: 'Activity',
    status: runStatus,
    score: Math.max(0, runScore),
    reason: runReason,
    tip: runTip,
  });

  // 2. Cycling & Commuting
  let bikeScore = 100;
  let bikeStatus: 'ideal' | 'caution' | 'avoid' = 'ideal';
  let bikeReason = 'Clear roads and comfortable breeze for cycling.';
  let bikeTip = 'Check tire pressure and wear a certified helmet.';

  if (windKmh > 35) {
    bikeScore -= 50;
    bikeReason = 'Dangerous gusty crosswinds for bicycle balance.';
    bikeTip = 'Lower riding posture and reduce downhill speeds.';
  }
  if (wmo.group === 'rain' || wmo.group === 'thunderstorm' || wmo.group === 'snow') {
    bikeScore -= 60;
    bikeReason = 'Reduced traction and wet braking distance.';
    bikeTip = 'Equip front/rear safety lights and mudguards.';
  }
  if (tempC < 0) {
    bikeScore -= 40;
    bikeReason = 'Risk of black ice patches on tarmac.';
  }
  if (bikeScore < 45) bikeStatus = 'avoid';
  else if (bikeScore < 75) bikeStatus = 'caution';

  activities.push({
    id: 'cycling',
    title: 'Cycling & Road Bike',
    category: 'sport',
    icon: 'Bike',
    status: bikeStatus,
    score: Math.max(0, bikeScore),
    reason: bikeReason,
    tip: bikeTip,
  });

  // 3. Outdoor Dining & Picnic
  let picnicScore = 100;
  let picnicStatus: 'ideal' | 'caution' | 'avoid' = 'ideal';
  let picnicReason = 'Warm pleasant weather for outdoor patio dining.';
  let picnicTip = 'Reserve an outdoor shaded table.';

  if (tempC < 16) {
    picnicScore -= 40;
    picnicReason = 'Cool air may feel chilly while sitting still.';
    picnicTip = 'Choose a heated terrace or bring a lap blanket.';
  } else if (tempC > 30) {
    picnicScore -= 35;
    picnicReason = 'Hot sun exposure during outdoor meals.';
    picnicTip = 'Look for covered pergolas or large patio umbrellas.';
  }
  if (wmo.group === 'rain' || wmo.group === 'drizzle' || wmo.group === 'thunderstorm') {
    picnicScore -= 80;
    picnicReason = 'Rain or drizzle will interrupt outdoor dining.';
    picnicTip = 'Opt for indoor seating or glass gazebo.';
  }
  if (windKmh > 25) {
    picnicScore -= 30;
    picnicReason = 'Breezy winds may blow away napkins and menus.';
  }
  if (picnicScore < 45) picnicStatus = 'avoid';
  else if (picnicScore < 75) picnicStatus = 'caution';

  activities.push({
    id: 'picnic',
    title: 'Outdoor Dining & Picnic',
    category: 'leisure',
    icon: 'Utensils',
    status: picnicStatus,
    score: Math.max(0, picnicScore),
    reason: picnicReason,
    tip: picnicTip,
  });

  // 4. Beach & Swimming
  let beachScore = 100;
  let beachStatus: 'ideal' | 'caution' | 'avoid' = 'ideal';
  let beachReason = 'Sunny warm climate ideal for water activities and sunbathing.';
  let beachTip = 'Apply sunscreen every 2 hours and wear a sun hat.';

  if (tempC < 22) {
    beachScore -= 60;
    beachReason = 'Water and air temperatures are too cool for sunbathing.';
    beachTip = 'Great for scenic beach walks with windbreakers.';
  }
  if (current.is_day === 0) {
    beachScore -= 70;
    beachReason = 'Night time limits water visibility and lifeguard safety.';
  }
  if (wmo.group === 'thunderstorm') {
    beachScore -= 100;
    beachReason = 'DANGER: Lightning hazard near water bodies.';
    beachTip = 'Seek immediate indoor shelter.';
  } else if (wmo.group === 'rain') {
    beachScore -= 50;
    beachReason = 'Precipitation ruins sunbathing experience.';
  }
  if (beachScore < 45) beachStatus = 'avoid';
  else if (beachScore < 75) beachStatus = 'caution';

  activities.push({
    id: 'beach',
    title: 'Beach & Water Swimming',
    category: 'outdoor',
    icon: 'Sun',
    status: beachStatus,
    score: Math.max(0, beachScore),
    reason: beachReason,
    tip: beachTip,
  });

  // 5. Hiking & Trail Trekking
  let hikeScore = 100;
  let hikeStatus: 'ideal' | 'caution' | 'avoid' = 'ideal';
  let hikeReason = 'Clear visibility and stable trail conditions.';
  let hikeTip = 'Pack sufficient water, map, and emergency trail snacks.';

  if (wmo.group === 'thunderstorm') {
    hikeScore -= 90;
    hikeReason = 'High exposure risk to mountain lightning strikes.';
  } else if (wmo.group === 'rain' || wmo.group === 'snow') {
    hikeScore -= 50;
    hikeReason = 'Muddy trails and slippery rock surfaces.';
    hikeTip = 'Trekking poles and waterproof ankle-support boots essential.';
  }
  if (tempC > 32) {
    hikeScore -= 40;
    hikeReason = 'Heat exhaustion risk on unshaded ridge paths.';
  }
  if (hikeScore < 45) hikeStatus = 'avoid';
  else if (hikeScore < 75) hikeStatus = 'caution';

  activities.push({
    id: 'hiking',
    title: 'Hiking & Mountain Trails',
    category: 'outdoor',
    icon: 'Compass',
    status: hikeStatus,
    score: Math.max(0, hikeScore),
    reason: hikeReason,
    tip: hikeTip,
  });

  // 6. Photography & Stargazing
  let photoScore = 100;
  let photoStatus: 'ideal' | 'caution' | 'avoid' = 'ideal';
  let photoReason = 'Good atmospheric clarity for landscape photography.';
  let photoTip = 'Golden hour occurs around sunrise and sunset times.';

  if (current.cloud_cover > 70) {
    photoScore -= 40;
    photoReason = 'Heavy cloud ceiling blocks night sky and direct golden light.';
  }
  if (wmo.group === 'rain' || wmo.group === 'fog') {
    photoScore -= 50;
    photoReason = 'Lens moisture and reduced horizon contrast.';
    photoTip = 'Use lens hood and rain cover for camera body.';
  }
  if (photoScore < 45) photoStatus = 'avoid';
  else if (photoScore < 75) photoStatus = 'caution';

  activities.push({
    id: 'photography',
    title: 'Landscape & Stargazing',
    category: 'leisure',
    icon: 'Camera',
    status: photoStatus,
    score: Math.max(0, photoScore),
    reason: photoReason,
    tip: photoTip,
  });

  // Alerts logic
  const alerts: WeatherAlert[] = [];

  if (uvIndex >= 8) {
    alerts.push({
      id: 'uv-extreme',
      severity: 'danger',
      title: 'Very High UV Radiation Index (' + uvIndex.toFixed(1) + ')',
      description: 'Unprotected skin and eyes can burn rapidly. Wear UV400 glasses, broad-spectrum sunscreen and hat.',
      icon: 'Sun',
    });
  } else if (uvIndex >= 6) {
    alerts.push({
      id: 'uv-moderate',
      severity: 'warning',
      title: 'Moderate UV Exposure Index (' + uvIndex.toFixed(1) + ')',
      description: 'Seek shade during midday peak hours (11:00 AM - 3:00 PM).',
      icon: 'Sun',
    });
  }

  if (windKmh >= 45) {
    alerts.push({
      id: 'wind-gale',
      severity: 'danger',
      title: 'High Wind Warning (' + Math.round(windKmh) + ' km/h)',
      description: 'Strong wind gusts detected. Secure loose outdoor furniture and watch for falling tree branches.',
      icon: 'Wind',
    });
  } else if (windKmh >= 30) {
    alerts.push({
      id: 'wind-breezy',
      severity: 'info',
      title: 'Breezy Conditions (' + Math.round(windKmh) + ' km/h)',
      description: 'Noticeable wind resistance outdoors. Hold onto hats and light accessories.',
      icon: 'Wind',
    });
  }

  if (wmo.group === 'thunderstorm') {
    alerts.push({
      id: 'thunderstorm-alert',
      severity: 'danger',
      title: 'Thunderstorm Warning',
      description: 'Lightning activity detected in area. Avoid tall isolated trees and open water.',
      icon: 'Zap',
    });
  }

  if (realTempC <= 0) {
    alerts.push({
      id: 'freeze-alert',
      severity: 'warning',
      title: 'Freezing Temperature (' + Math.round(realTempC) + '°C)',
      description: 'Watch for slippery ice on walkways, roads, and bridges. Keep pipes winterized.',
      icon: 'Snowflake',
    });
  }

  if (realTempC >= 35) {
    alerts.push({
      id: 'heat-alert',
      severity: 'danger',
      title: 'Extreme Heat Warning (' + Math.round(realTempC) + '°C)',
      description: 'Risk of heat illness. Drink fluids frequently and stay in air-conditioned spaces.',
      icon: 'Flame',
    });
  }

  // Comfort score calculation
  let comfortScore = 100;
  if (Math.abs(tempC - 21) > 0) {
    comfortScore -= Math.min(50, Math.abs(tempC - 21) * 2.5);
  }
  if (current.relative_humidity > 70) comfortScore -= (current.relative_humidity - 70) * 0.5;
  if (current.relative_humidity < 30) comfortScore -= (30 - current.relative_humidity) * 0.5;
  if (windKmh > 20) comfortScore -= (windKmh - 20) * 0.8;
  if (wmo.group === 'rain') comfortScore -= 20;
  if (wmo.group === 'thunderstorm') comfortScore -= 40;

  comfortScore = Math.max(10, Math.min(100, Math.round(comfortScore)));

  let comfortLabel = 'Optimal Outdoor Comfort';
  if (comfortScore < 40) comfortLabel = 'Uncomfortable Weather Conditions';
  else if (comfortScore < 65) comfortLabel = 'Moderate Comfort Level';
  else if (comfortScore < 85) comfortLabel = 'Pleasant & Comfortable';

  return {
    outfits,
    outfitSummary,
    activities,
    alerts,
    comfortScore,
    comfortLabel,
  };
}
