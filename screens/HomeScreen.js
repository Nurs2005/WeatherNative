import React,{useCallback, useEffect, useState} from 'react';
import { StatusBar, StyleSheet, Text, View, Image, TextInput, TouchableOpacity,ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import {CalendarDaysIcon, MagnifyingGlassIcon} from 'react-native-heroicons/outline'
import {MapPinIcon} from 'react-native-heroicons/solid'
import {debounce} from 'lodash'
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants';
import { getData, storeData } from '../utilst/asyncStorage';
export default function HomeScreen() {
    const [showSearch,toggleSearch] = useState(false)
    const [locations,setLocations]= useState([])
    const [weather,setWeather] =useState({})
    const [loading,setLoading]= useState(true)
    const handleLocation = (loc)=>{
        setLocations([])
        toggleSearch(false)
        setLoading(true)
        fetchWeatherForecast({
            cityName:loc.name,
            days:'7',
        }).then(data=>{
            setWeather(data)
            setLoading(false)
            storeData('city',loc.name)
            console.log(data)
        })
    }
    const handleSearch =value=>{
        if(value.length>2){
            fetchLocations({cityName:value}).then(data=>{
                setLocations(data)
            })
        }
    }
    useEffect(()=>{
        fecthMyWeatherData()
    },[])

    const fecthMyWeatherData= async()=>{
        let myCity = await getData('city')
        let cityName = 'islamabahd'
        if(myCity) cityName = myCity
        fetchWeatherForecast({
            cityName,
            days:'7'
        }).then(data=>{
            setWeather(data)
            setLoading(false)
        })
    }

    const handleTextDebounce = useCallback(debounce(handleSearch,1200),[])

    const {current,location} = weather

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image blurRadius={70} style={styles.bgImage} source={require('../assets/images/bg.png')} />
      {
        loading?(
            <View style={styles.loading}>
                <Text fontSize='55'>loading...</Text>
            </View>
        ):(
            <SafeAreaView style={styles.block}>
            <View style={styles.inputBlock}>
              <View style={[
              styles.inputBlockMini,
              {
                backgroundColor: !showSearch ? theme.bgWhite(0.3) : 'transparent', 
              }
            ]}>
                {
                    !showSearch?(
                        <TextInput
                        onChangeText={handleTextDebounce}
                        style={styles.textInput}
                        placeholder='Search city'
                        placeholderTextColor='lightgray'
                      />
                    ):null
                }
                <TouchableOpacity
                style={styles.touchIcon}
                onPress={()=>{toggleSearch(!showSearch)}}
                >
                    <MagnifyingGlassIcon/>
                </TouchableOpacity>
              </View>
            </View>
            {
                locations.length>0 && !showSearch?(
                    <View style={[styles.city, { zIndex: 2 }]}>
                        {
                            locations.map((loc,index)=>{
                                return(
                                <TouchableOpacity 
                                key={index}
                                onPress={()=>handleLocation(loc)}
                                style={styles.touchCity}
                                >
                                    <MapPinIcon style={styles.cityIcon}/>
                                    <Text style={styles.cityText}>{loc?.name},{loc?.country}</Text>
                                </TouchableOpacity>
                                )
                            })
                        }
                    </View> 
                ):null
              }
            <View>
                <Text style={styles.cityName}>
                     {location?.name},
                    <Text style={styles.cityNameOne}>
                        {' '+location?.country}
                    </Text>
                </Text>
                <View style={styles.sunBlock}>
                    <Image style={[styles.sunimage, { zIndex: 1 }]} resizeMode="cover" source={weatherImages[current?.condition?.text]}/>
                </View>
                <View style={styles.cel}>
                    <Text style={styles.celTextOne}>
                    {current?.temp_c}&#176;
                    </Text>
                    <Text style={styles.celTextTwo}>
                    {current?.condition?.text}
                    </Text>
                </View>
            <View style={styles.blockThree}>
                <View style={styles.blockThreeMini}>
                    <View style={styles.blockThreeMiniIn}>
                        <Image style={styles.blockThreeImg} source={require('../assets/icons/wind.png')}/>
                        <Text style={styles.blockThreeText}>{current?.wind_kph}km</Text>
                    </View>
                </View>
                <View style={styles.blockThreeMini}>
                    <View style={styles.blockThreeMiniIn}>
                        <Image style={styles.blockThreeImg} source={require('../assets/icons/drop.png')}/>
                        <Text style={styles.blockThreeText}>{current?.humidity}%</Text>
                    </View>
                </View>
                <View style={styles.blockThreeMini}>
                    <View style={styles.blockThreeMiniIn}>
                        <Image style={styles.blockThreeImg} source={require('../assets/icons/sun.png')}/>
                        <Text style={styles.blockThreeText}>{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                    </View>
                </View>
            </View>
            </View>
            <View style={styles.blockFour}>
                <View style={styles.blockFourIcons}>
                    <CalendarDaysIcon style={styles.blockFourIcon}/>
                    <Text style={styles.blockFourText}>Daily forecast</Text>
                </View>
                <ScrollView 
                horizontal
                style={styles.ScrollView}
                >
                    {
                        weather?.forecast?.forecastday?.map((item,index)=>{
                            let date = new Date(item.date)
                            let options = {weekday:'long'}
                            let dayName = date.toLocaleDateString('en-Us',options)
                            dayName = dayName.split(',')[0]
                            return(
                            <View key={index} style={styles.blockCard}>
                                <Image style={styles.blockFourImg} source={weatherImages[item?.day?.condition?.text]}/> 
                                <Text style={styles.blockFourText}>{dayName}</Text>
                                <Text style={styles.blockFourTextOne}>{item?.day?.avgtemp_c}&#176;</Text>
                            </View>
                            )
                        })
                    }
                </ScrollView>
            </View>
          </SafeAreaView>
        )
      }

    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    bgImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    block: {
      flex: 1,
      alignItems: 'center',
    },
    inputBlock: {
      height: '6%',
      width: '90%',
      borderRadius: 20,
    },
    inputBlockMini: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      borderRadius: 20,
    },
    textInput: {
      width: '50%',
      paddingLeft: 20,
      flex: 1,
    },
    touchIcon: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '12%',
      height: '88%',
      borderRadius: 25,
      backgroundColor: theme.bgWhite(0.3),
      marginRight: 3,
    },
    city: {
      width: '90%',
      height:'8%',
      position: 'absolute',
      top: 70,
      zIndex: 2,
      top:50,
    },
    touchCity: {
      height: '100%',
      flexDirection: 'row',
      backgroundColor: 'white',
      alignItems: 'center',
      borderRadius: 20,
      padding: 10,
      borderBlockColor: 'gray',
      marginTop:5
    },
    cityIcon: {
      color: 'gray',
    },
    cityText: {
      fontSize: 20,
    },
    cityName: {
      fontSize: 30,
      color: 'white',
      textAlign: 'center',
    },
    cityNameOne: {
      fontSize: 20,
    },
    sunimage: {
      width: 250,
      height: 250,
      position: 'relative',
      zIndex: 1,
    },
    sunBlock: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingTop: 25,
      paddingBottom: 35,
    },
    cel: {
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    celTextOne: {
      paddingLeft: 25,
      fontSize: 55,
      fontWeight: '700',
      textAlign: 'center',
      color: 'white',
    },
    celTextTwo: {
      fontSize: 25,
      fontWeight: '300',
      textAlign: 'center',
      color: 'white',
    },
    blockThree: {
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: 10,
    },
    blockThreeMiniIn: {
      padding: 5,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    blockThreeImg: {
      marginRight: 5,
      width: 30,
      height: 30,
    },
    blockThreeText: {
      fontSize: 20,
      color: 'white',
    },
    blockFour: {
      width: '90%',
      paddingTop: 35,
    },
    blockFourImg: {
      width: 50,
      height: 50,
    },
    blockFourIcons: {
      flexDirection: 'row',
    },
    blockFourIcon: {
      color: 'white',
    },
    blockFourText: {
      color: 'white',
      fontSize: 15,
    },
    blockCard: {
      padding: 10,
      flex: 1,
      width: 100,
      backgroundColor: theme.bgWhite(0.3),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      marginLeft: 10,
    },
    blockFourTextOne: {
      color: 'white',
      fontSize: 22,
      fontWeight: '500',
      paddingLeft: 10,
    },
    ScrollView: {
      paddingTop:10
    },

    loading:{
      width:'100%',
      height:'100%',
      alignItems:'center',
      justifyContent:'center'
    }
  });
  
  