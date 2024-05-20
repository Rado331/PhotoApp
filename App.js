import React, { useState, useRef } from 'react';
import { View, Button, Image, StyleSheet, Alert, PanResponder } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function App() {
    const [image, setImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const canvasRef = useRef(null);

    // Fonction pour télécharger la photo depuis la galerie
    const telechargerPhoto = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("Permission d'accès à la galerie refusée.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImage(result.uri);
            uploadPhoto(result.uri);
        }
    };

    // Fonction pour uploader la photo vers le serveur
    const uploadPhoto = async (uri) => {
        const formData = new FormData();
        formData.append('photo', {
            uri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await axios.post('http://YOUR_SERVER_URL/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setProcessedImage(`http://YOUR_SERVER_URL/${response.data.imagePath}`);
            Alert.alert('Photo uploaded', 'Your photo has been uploaded and processed.');
        } catch (error) {
            console.error(error);
            Alert.alert('Upload failed', 'Failed to upload the photo.');
        }
    };

    // PanResponder pour gérer l'interaction tactile
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                // Logique pour révéler l'image peinte
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.arc(gestureState.moveX, gestureState.moveY, 20, 0, 2 * Math.PI);
                    ctx.fill();
                }
            },
        })
    ).current;

    return (
        <View style={styles.container}>
            {image && <Image source={{ uri: image }} style={styles.image} />}
            {processedImage && (
                <View {...panResponder.panHandlers} style={styles.canvasContainer}>
                    <canvas ref={canvasRef} width={300} height={300} style={styles.canvas} />
                    <Image source={{ uri: processedImage }} style={styles.image} />
                </View>
            )}
            <Button title="Télécharger une photo" onPress={telechargerPhoto} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    canvasContainer: {
        position: 'relative',
    },
    canvas: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
});
