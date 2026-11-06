# base image
FROM python:3.13.5
# working directory
WORKDIR /app
# copy command
COPY . /app
# run command
RUN pip install -r requirements.txt
# port
EXPOSE 5000
# command
CMD ["python","./app.py"]