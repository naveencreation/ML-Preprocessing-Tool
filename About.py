import streamlit as st
from PIL import Image

def About():
    # Custom Styling
    st.markdown(
        """
        <style>
        .main-header { font-size: 42px; font-weight: bold; text-align: center; color: #ffcc00; }
        .sub-header { font-size: 26px; font-weight: bold; color: #cccccc; margin-top: 20px; }
        .section-text { font-size: 18px; color: #bbbbbb; }
        .highlight { color: #00aaff; font-weight: bold; }
        .fun-quote { font-size: 20px; font-style: italic; color: #ff9900; text-align: center; margin-top: 10px; }
        body { background-color: #000000; }
        </style>
        """, unsafe_allow_html=True
    )

    # Profile Header
    st.markdown("<p class='main-header'>👨‍💻 Meet Naveen S - The AI Enthusiast! 🚀</p>", unsafe_allow_html=True)
    st.markdown("<p class='fun-quote'>‘Turning caffeine into code & ideas into innovation!’ ☕💡</p>", unsafe_allow_html=True)

    # Summary Section
    st.markdown("<p class='section-text'>Hey there! I'm an aspiring <span class='highlight'>AI & Data Science Engineer</span> on a mission to explore the vast universe of Machine Learning, Optimization, and Full-Stack Development. If it involves algorithms, automation, or making machines ‘think’ – count me in! 🤖✨</p>", unsafe_allow_html=True)

    # Education
    st.markdown("<p class='sub-header'>🎓 Education</p>", unsafe_allow_html=True)
    st.markdown("""
    - **B.Tech Artificial Intelligence and Data Science**  
      *Karpagam College of Engineering* (2026) - **CGPA: 8.45**
    """)

    # Skills Section
    st.markdown("<p class='sub-header'>🚀 Superpowers (Skills)</p>", unsafe_allow_html=True)
    st.markdown("""
    - **Languages:** Python 🐍, Java ☕  
    - **Frameworks & Libraries:** Numpy, Pandas, Scikit-learn, TensorFlow, Keras, Spark, Hadoop, Streamlit  
    - **Databases & Tools:** MySQL, MongoDB, Git, Docker, Tableau  
    - **Soft Skills:** Time Travel Management (okay, just Time Management ⏳), Team Collaboration, and Crystal Clear Communication 📢
    """)

    # Projects Section
    st.markdown("<p class='sub-header'>🔬 Epic Creations (Projects)</p>", unsafe_allow_html=True)
    st.markdown("""
    - **🚗 Vehicle Routing Problem Optimization Using Genetic Algorithm** *(Jan 2025 - Present)*  
      *Cracking logistics like a puzzle master! Optimized delivery routes and cut operational costs by 30% using DEAP and Python.*

    - **📊 Dimensionality Reduction with K-Means & Naive Bayes** *(Dec 2024 - Present)*  
      *Boosted classification accuracy to 81% while slashing inference time by 30%. Data science magic! 🎩✨*

    - **🏥 Medico Plus - Frontend Developer** *(Mar 2024 - Present)*  
      *Bridging the gap between doctors and patients with a multilingual medical platform! 🌍💙*

    - **🤖 Automated Machine Learning Framework** *(Jun 2023 - Sep 2023)*  
      *Built an AutoML system that makes AI smarter, workflows smoother, and predictions sharper (20% better accuracy!).*
    """)

    # Contact Section
    st.markdown("<p class='sub-header'>📬 Let’s Connect & Build Something Awesome!</p>", unsafe_allow_html=True)
    st.markdown("""
    - 📧 [naveenselvan0004@gmail.com](mailto:naveenselvan0004@gmail.com)  
    - 💻 [GitHub](https://github.com/naveencreation) | [LinkedIn](https://www.linkedin.com/in/naveen0004/) | [Leetcode](https://leetcode.com/u/naveenselvan/)  
    """)

    st.success("🌟 Always up for a tech talk, hackathon, or a fun AI experiment! Let's create something revolutionary! 🚀")
