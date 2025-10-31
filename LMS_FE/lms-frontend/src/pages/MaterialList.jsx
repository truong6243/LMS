import React from 'react';

const MaterialList = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Danh sách học liệu
      </h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Trang này sẽ hiển thị danh sách các học liệu có trong hệ thống.
      </p>
      
      <div style={{ 
        padding: '40px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        textAlign: 'center',
        border: '2px dashed #ddd'
      }}>
        <p style={{ color: '#999', fontSize: '16px' }}>
          📚 Chức năng đang được phát triển...
        </p>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
          Sau này chúng ta sẽ thêm bảng dữ liệu ở đây
        </p>
      </div>
    </div>
  );
};

export default MaterialList;
