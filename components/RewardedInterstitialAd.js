import React, { useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import {
    RewardedInterstitialAd,
    RewardedAdEventType,
    TestIds,
    AdEventType,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.REWARDED_INTERSTITIAL : 'ca-app-pub-9242328705068667/9948794169'; // Replace with your production AdMob Unit ID
const rewardedInterstitialAd = RewardedInterstitialAd.createForAdRequest(adUnitId);

const RewardedInterstitialAdComponent = ({ onRewardEarned }) => {
    useEffect(() => {
        const unsubscribeLoaded = rewardedInterstitialAd.addAdEventListener(AdEventType.LOADED, () => {
            console.log('Rewarded Interstitial Ad Loaded');
        });

        const unsubscribeEarned = rewardedInterstitialAd.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            (reward) => {
                console.log('User earned reward of:', reward);
                if (onRewardEarned) {
                    onRewardEarned(reward);
                }
            }
        );

        // Load the ad
        rewardedInterstitialAd.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
        };
    }, [onRewardEarned]);

    const showRewardedInterstitialAd = () => {
        if (rewardedInterstitialAd.loaded) {
            rewardedInterstitialAd.show();
        } else {
            console.log('Ad not loaded yet');
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Show Rewarded Interstitial Ad" onPress={showRewardedInterstitialAd} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
});

export default RewardedInterstitialAdComponent;
