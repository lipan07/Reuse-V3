import React, { useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import {
    RewardedAd,
    RewardedAdEventType,
    TestIds,
    AdEventType,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-9242328705068667/9948794169'; // Replace with your AdMob Unit ID

const rewardedAd = RewardedAd.createForAdRequest(adUnitId);

const RewardedAdComponent = ({ onRewardEarned }) => {
    useEffect(() => {
        const unsubscribeLoaded = rewardedAd.addAdEventListener(AdEventType.LOADED, () => {
            console.log('Rewarded Ad Loaded');
        });

        const unsubscribeEarned = rewardedAd.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            (reward) => {
                console.log('User earned reward of:', reward);
                if (onRewardEarned) {
                    onRewardEarned(reward);
                }
            }
        );

        // Load the ad
        rewardedAd.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
        };
    }, [onRewardEarned]);

    const showRewardedAd = () => {
        if (rewardedAd.loaded) {
            rewardedAd.show();
        } else {
            console.log('Ad not loaded yet');
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Show Rewarded Ad" onPress={showRewardedAd} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
});

export default RewardedAdComponent;
