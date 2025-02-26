import React from 'react';

const LoadingSpinner = ({asOverlay}) => {
    return (
        <>
        {asOverlay ? (
            <>
            <div className='backdrop'>
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect className="spinner_zWVm" x="1" y="1" width="7.33" height="7.33"/><rect className="spinner_gfyD" x="8.33" y="1" width="7.33" height="7.33"/><rect className="spinner_T5JJ" x="1" y="8.33" width="7.33" height="7.33"/><rect className="spinner_E3Wz" x="15.66" y="1" width="7.33" height="7.33"/><rect className="spinner_g2vs" x="8.33" y="8.33" width="7.33" height="7.33"/><rect className="spinner_ctYB" x="1" y="15.66" width="7.33" height="7.33"/><rect className="spinner_BDNj" x="15.66" y="8.33" width="7.33" height="7.33"/><rect className="spinner_rCw3" x="8.33" y="15.66" width="7.33" height="7.33"/><rect className="spinner_Rszm" x="15.66" y="15.66" width="7.33" height="7.33"/>
                </svg>            
            </div>
            </>
        ) : (
            <>
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path className="spinner_7mtw" d="M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z"/></svg>
            </>
        )}
        </>
    )
}

export default LoadingSpinner;