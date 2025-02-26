import ContentLoader from "react-content-loader";
import { Row, Col } from "react-bootstrap";

const SkeletonBlock = (props) => (
  <ContentLoader
    speed={2}
    width="100%"
    height={props.height}
    viewBox={`0 0 ${props.width} ${props.height}`}
    backgroundColor="#222"
    foregroundColor="#333"
    {...props}
  >
    <rect x="0" y="0" rx="8" ry="8" width="100%" height={props.height} />
  </ContentLoader>
);

const SkeletonLoader = ({ type }) => {
  return (
    <>
      {type === "slider" ? (
        <Row>
          <Col xs={12} className="d-block d-md-none">
            <SkeletonBlock width={"100%"} height={500} />
          </Col>

          {[...Array(4)].map((_, index) => (
            <Col key={index} md={3} className="d-none d-md-block">
              <SkeletonBlock width={"100%"} height={500} />
            </Col>
          ))}
        </Row>
      ) : type === "quiz-info" ? (
        <Row>
          <Col lg={12}>
            <SkeletonBlock width={"100%"} height={800} />
          </Col>
        </Row>
      ) : type === "question" ? (
        <Row>
          <Col lg={12}>
            <div className='custom-question-loader'>
            <SkeletonBlock width={"50%"} height={150} />
            <SkeletonBlock width={"100%"} height={40} />
            </div>
          </Col>

          <Col lg={6}>
            <div className='custom-question-loader'>
            <SkeletonBlock width={"50%"} height={150} />
            <SkeletonBlock width={"100%"} height={40} />
            </div>
          </Col>

          <Col lg={6}>
            <div className='custom-question-loader'>
            <SkeletonBlock width={"50%"} height={150} />
            <SkeletonBlock width={"100%"} height={40} />
            </div>
          </Col>
        </Row>
      ) : null}
    </>
  );
};

export default SkeletonLoader;
