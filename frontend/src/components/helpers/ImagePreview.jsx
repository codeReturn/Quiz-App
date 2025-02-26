import React, { useState, useEffect } from 'react';

const ImagePreview = ({ imageUrl }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isValidImage, setIsValidImage] = useState(false);

    useEffect(() => {
        const checkImage = async () => {
            const img = new Image();
            img.onload = () => {
                setIsLoading(false);
                setIsValidImage(true);
            };
            img.onerror = () => {
                setIsLoading(false);
                setIsValidImage(false);
            };
            img.src = imageUrl;
        };

        checkImage();
    }, [imageUrl]);

    return (
        <div>
            {isLoading && <p>Loading...</p>}
            {!isLoading && isValidImage ? (
                <>
                    <div className='img-preview-plugin'>
                        <img src={imageUrl} alt="Preview" loading='lazy' className='img-fluid img-thumbnail' />
                    </div>
                </>
            ) : (
                !isLoading && <p>Error: Invalid image URL</p>
            )}
        </div>
    );
};

export default ImagePreview;
