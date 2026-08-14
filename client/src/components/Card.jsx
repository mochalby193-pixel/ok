export const Card = ({ 
  title, 
  description, 
  image, 
  progress, 
  onClick,
  children,
  className = '',
  hover = false,
}) => {
  return (
    <div 
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
    >
      {image && (
        <div className="mb-4">
          <img src={image} alt={title} className="w-full h-48 object-cover rounded-lg" />
        </div>
      )}
      
      {title && (
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      )}
      
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      
      {progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};
