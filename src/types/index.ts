// 버스 정보 관련 타입들
export interface BusRoute {
  adminName: string;
  routeId: string;
  routeName: string;
  routeTypeName: string;
  districtCd: number;
  upFirstTime: string;
  upLastTime: string;
  downFirstTime: string;
  downLastTime: string;
  peekAlloc: number;
  nPeekAlloc: number;
  company: string;
  companyTel: string;
  startStationName: string;
  endStationName: string;
}

export interface BusStop {
  id?: number;
  stationId: number;
  stationName: string;
  x: number; // 경도
  y: number; // 위도
  // districtCd: number;
  mobileNo: string;
  regionName: string;
  centerYn: string;
  distance?: number;
  stationSeq?: number;
}

export interface BusStopAroundList {
  centerYn: string;
  mobileNo: string;
  regionName: string;
  stationId: number;
  stationName: string;
  x: number; // 경도
  y: number; // 위도
  distance: number;
}

export interface BusNearbyStop {
  response: {
    comMsgHeader: string;
    msgHeader: {
      queryTime: string;
      resultCode: string;
      resultMessage: string;
    };
    msgBody: {
      busStationAroundList: BusStopAroundList[];
    };
  };
}

export interface BusRouteResponse {
  response: {
    msgBody: {
      busRouteStationList?: {
        adminName: string;
        centerYn: string;
        districtCd: string;
        mobileNo: number;
        regionName: string;
        stationId: number;
        stationName: string;
        stationSeq: number;
        turnSeq: number;
        x: number;
        y: number;
      }[];
    };
  };
}

export interface BusArrival {
  stationId: number;
  routeId: string;
  locationNo1: number;
  predictTime1: number;
  predictTimeSec1: number;
  locationNo2: number;
  predictTime2: number;
  predictTimeSec2: number;
  staOrder: number;
  flag: string;
  routeName: string;
  lowPlate1: number;
  lowPlate2: number;
  stationNm1: string;
  stationNm2: string;
  routeDestName: string;
  crowded1: number;
  crowded2: number;
  turnSeq: number;
}

export interface StationType {
  adminName: string;
  centerYn: string;
  districtCd: string;
  mobileNo: number;
  regionName: string;
  stationId: number;
  stationName: string;
  stationSeq: number;
  turnSeq: number;
  x: number;
  y: number;
}

export interface LocationType {
  crowded: number;
  lowPlate: number;
  plateNo: string;
  remainSeatCnt: number;
  routeId: string;
  routeTypeCd: number;
  stateCd: number;
  stationId: number;
  stationSeq: number;
  taglessCd: number;
  vehId: number;
}
export interface BusPosition {
  plateNo: string;
  routeId: string;
  stationId: number;
  remainSeatCnt: number;
  plateType: number;
  x: number;
  y: number;
}

// API 응답 타입들
export interface ApiResponse<T> {
  comMsgHeader: string;
  msgHeader: {
    queryTime: string;
    resultCode: string;
    resultMessage: string;
  };
  msgBody: T;
}

export interface BusRouteListResponse {
  busRouteList: BusRoute[];
}

export interface BusStopListResponse {
  busStationAroundList: BusStop[];
}

export interface BusArrivalResponse {
  busArrivalList: BusArrival[];
}

// Redux 상태 타입들
export interface AppState {
  favorites: string[];
  recentSearches: string[];
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
}


export interface WeatherType {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  rain: {
    "1h": number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface HourlyType {
  clouds: number;
  dew_point: number;
  dt: number;
  feels_likes: number;
  humidity: number;
  pop: number;
  pressure: number;
  temp: number;
  uvi: number;
  visibility: number;
  weather: [];
  wind_deg: number;
  wind_gust: number;
  wind_speed: number;
  rain?: {
    "1h": number;
  };
  snow?: {
    "1h": number;
  }
}
export interface CurrentWeatherAndForecastType {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    clouds: number;
    dew_point: number;
    dt: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    sunrise: number;
    sunset: number;
    temp: number;
    uvi: number;
    visibility: number;
    rain?: {
      "1h": number;
    };

    snow?: {
      "1h": number;
    };

    weather: [
      {
        description: string;
        icon: string;
        id: number;
        main: string;
      }
    ];
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
  };
  minutely: [];
  hourly: HourlyType[];
  daily: [];
  alerts: [];
}

export interface WeatherOverviewType {
  lat: number;
  lon: number;
  tz: string;
  date: string;
  units: string;
  weather_overview: string;

}

export interface StreetNameType {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  name: string;
  display_name: string;
  address: {
    road: string;
    city: string;
    county: string;
    postcode: string;
  };
}

export interface WeatherPositionType {
  country: string;
  lat: number;
  lon: number;
  name: string;
  local_names: string;
  id: number;
  created_at: string;
  updated_at: string;
}