import React from 'react';
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudHail,
  CloudSnow,
  Snowflake,
  CloudSunRain,
  CloudLightning,
  Umbrella,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Thermometer,
  Zap,
  Activity,
  Bike,
  Utensils,
  Compass,
  Camera,
  Shirt,
  Footprints,
  Scissors,
  Glasses,
  Sunrise,
  Sunset,
  Flame,
  ShieldAlert,
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'Sun':
      return <Sun className={className} />;
    case 'SunDim':
      return <SunDim className={className} />;
    case 'CloudSun':
      return <CloudSun className={className} />;
    case 'Cloud':
      return <Cloud className={className} />;
    case 'CloudFog':
      return <CloudFog className={className} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={className} />;
    case 'CloudRain':
      return <CloudRain className={className} />;
    case 'CloudRainWind':
      return <CloudRainWind className={className} />;
    case 'CloudHail':
      return <CloudHail className={className} />;
    case 'CloudSnow':
      return <CloudSnow className={className} />;
    case 'Snowflake':
      return <Snowflake className={className} />;
    case 'CloudSunRain':
      return <CloudSunRain className={className} />;
    case 'CloudLightning':
      return <CloudLightning className={className} />;
    case 'Umbrella':
      return <Umbrella className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Gauge':
      return <Gauge className={className} />;
    case 'Thermometer':
      return <Thermometer className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Bike':
      return <Bike className={className} />;
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Shirt':
      return <Shirt className={className} />;
    case 'Footprints':
      return <Footprints className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'Glasses':
      return <Glasses className={className} />;
    case 'Sunrise':
      return <Sunrise className={className} />;
    case 'Sunset':
      return <Sunset className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    default:
      return <Cloud className={className} />;
  }
};
