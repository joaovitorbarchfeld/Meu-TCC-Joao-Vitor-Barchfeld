interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #071327 0%, #2C0F4D 100%)',
      color: '#ffffff'
    }}>
      {children}
    </div>
  );
};